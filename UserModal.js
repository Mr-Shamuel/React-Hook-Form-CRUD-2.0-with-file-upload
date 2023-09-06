import React, { useEffect, useState } from "react";
import {
    Col,
    Row, 
    Form,
    Modal,
    Button, 
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next"; 
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../../Services/Interceptor";
import Tokenvalidation from "../../../Authentication/Tokenvalidation";
import { getRoleData } from "../../../Redux/Actions/Configuration/RoleAction";
import { getUserData } from "../../../Redux/Actions/SubordinateOffice/User/UserAction";
import { getHierarchyData } from "../../../Redux/Actions/Configuration/HierarchyAction";
import { getDesignationData } from "../../../Redux/Actions/Configuration/DesignationAction";

const UserModal = ({
    reset,
    errors,
    register,
    btnState,
    setValue,
    showModal,
    setBtnState,
    handleSubmit,
    setShowModal,
    updateUserData,
    setUpdateUserData,
  
}) => {
    const dispatch = useDispatch();
    //current language
    const { t, i18n } = useTranslation();
    const { hierarchy } = useSelector((state) => state?.hierarchy);
    const { designation } = useSelector((state) => state?.designation);
    const { roleData } = useSelector((state) => state.roleData);

    const [higherOffice, setHigherOffice] = useState([]);
    const [Uploadedfile, setUploadedFile] = useState({});

    const [showPass1, setShowPass1] = useState(false);
    const [showPass2, setShowPass2] = useState(false);

    useEffect(() => {
        dispatch(getHierarchyData());
        dispatch(getDesignationData(1));
        dispatch(getRoleData(1));
    }, [dispatch]);

    //upload file
    const handleChangeFile = (e) => {
        axiosInstance
            .post(
                "/core-module/api/v1/file-storages/create",
                { file: e.target.files[0] },
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )
            .then((res) => {
                console.log("fileUpload Data: ", res?.data);
                setUploadedFile(res?.data);
            })
            .catch((error) => console.log(error, "err"));
    };


    useEffect(() => {
        if (updateUserData?.id) {
            axiosInstance
                .get(
                    `/core-module/api/v1/organizations/parents?hierarchyId=${updateUserData?.hierarchyId}&ids`
                )
                .then((res) => {
                    setHigherOffice(res?.data?.data);
                })
                .catch((err) => {
                    console.log(err, "err");
                });
        }
        reset(updateUserData);
    }, [updateUserData]);

    const handleHierarchyChange = (id) => {
        const hierarchyID = parseInt(id);
        axiosInstance
            .get(
                `/core-module/api/v1/organizations/parents?hierarchyId=${hierarchyID}&ids`
            )
            .then((res) => {
                setHigherOffice(res?.data?.data);
            })
            .catch((err) => {
                console.log(err, "err");
            });
        setUpdateUserData({});
    };

    const onSubmit = (data) => {
        Tokenvalidation();
        data.designationId = JSON.parse(data?.designationId);
        data.roleIds = JSON.parse(data?.roleIds);
        data.hierarchyId = JSON.parse(data?.hierarchyId);
        data.organizationId = JSON.parse(data?.organizationId);
        data.statusId = JSON.parse(data?.statusId);

        let datas = {
            firstName: data?.firstName,
            userId: data?.userId,
            designationId: data?.designationId,
            roleIds: data?.roleIds,
            hierarchyId: data?.hierarchyId,
            organizationId: data?.organizationId,
            mobile: data?.mobile,
            phone: data?.phone,
            password: data?.password,
            email: data?.email,
            signatureName: Uploadedfile?.fileName, //for image upload
            signaturePath: Uploadedfile?.filePath,
            statusId: data?.statusId,
        };

        // if pass not match then alert message else create or update
        if (data.password !== data.confirmPass) {
            toast.error("ব্যবহারকারীর পাসওয়ার্ড মেলেনি", {
                position: toast.POSITION.TOP_RIGHT,
                hideProgressBar: false,
                autoClose: 1000,
                theme: "colored",
            });
        } else {
            if (btnState === "update") {
                axiosInstance
                    .put(`/auth-service/api/v1/auth/users/${updateUserData.id}`, datas)
                    .then((res) => {
                        console.log(res);
                        if (res?.status === 200) {
                            dispatch(getUserData());
                            setUpdateUserData({});
                            setShowModal(false);

                            toast.success(t("CommonToast.save"), {
                                position: toast.POSITION.TOP_RIGHT,
                                hideProgressBar: false,
                                autoClose: 1000,
                                theme: "colored",
                            });
                        }
                    })
                    .catch((err) => {
                        toast.error(t("CommonToast.uniqueMessage"), {
                            position: toast.POSITION.TOP_RIGHT,
                            hideProgressBar: false,
                            theme: "colored",
                            autoClose: 1500,
                        });
                    });
            } else {
                //create
                axiosInstance
                    .post("/auth-service/api/v1/auth/registerUser", datas)
                    .then((res) => {
                        dispatch(getUserData());
                        setShowModal(false);
                        toast.success(t("CommonToast.save"), {
                            position: toast.POSITION.TOP_RIGHT,
                            hideProgressBar: false,
                            autoClose: 1000,
                            theme: "colored",
                        });
                    })
                    .catch((err) => {
                        toast.error(t("CommonToast.uniqueMessage"), {
                            position: toast.POSITION.TOP_RIGHT,
                            hideProgressBar: false,
                            theme: "colored",
                            autoClose: 1500,
                        });
                    });
            }
        }
    };

    const handleCloseModal = () => {
        setUpdateUserData({});
        setShowModal(false);
        reset();
    };

    return (
        <div>
            <Col lg={4} md={6} sm={4}>
                <Modal
                    size="lg"
                    show={showModal}
                    centered
                    aria-labelledby="example-modal-sizes-title-sm"
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Modal.Header>
                            <Modal.Title id="contained-modal-title-vcenter">
                                {t("User.header")}
                            </Modal.Title>
                            <Button
                                variant=""
                                className="btn btn-close btn-danger m-0 p-1"
                                onClick={handleCloseModal}
                            >
                                X
                            </Button>
                        </Modal.Header>

                        <Modal.Body>
                            <div className="pd-30 pd-sm-20">
                                <Row className="row-xs align-items-center mg-b-20">
                                    <Col lg={6} md={6} sm={12} xs={12}>
                                        <Form.Label className="form-label mg-b-0  text-dark mb-2">
                                            {t("User.firstName")}
                                            <span className="text-danger">*</span>
                                        </Form.Label>

                                        <Form.Control
                                            as="input"
                                            placeholder={t("CommonBtn.placeholder2")}
                                            style={{ height: "50px" }}
                                            type="text"
                                            {...register("firstName", {
                                                required: true,
                                            })}
                                        />

                                        {errors?.firstName?.type === "required" && (
                                            <span
                                                className="text-danger"
                                                style={{ fontSize: "16px" }}
                                            >
                                                {i18n.language === "en"
                                                    ? " Name (Bangla) Required"
                                                    : "এই তথ্যটি আবশ্যক"}
                                            </span>
                                        )}
                                    </Col>

                                    <Col lg={6} md={6} sm={12} xs={12}>
                                        <Form.Label className="form-label mg-b-0  text-dark mb-2">
                                            {t("User.userId")}
                                            <span className="text-danger">*</span>
                                        </Form.Label>

                                        <Form.Control
                                            as="input"
                                            placeholder={t("CommonBtn.placeholder2")}
                                            style={{ height: "50px" }}
                                            type="text"
                                            {...register("userId", {
                                                required: true,
                                            })}
                                        />

                                        {errors?.userId?.type === "required" && (
                                            <span
                                                className="text-danger"
                                                style={{ fontSize: "16px" }}
                                            >
                                                {i18n.language === "en"
                                                    ? " Name (English) Required"
                                                    : "এই তথ্যটি আবশ্যক"}
                                            </span>
                                        )}
                                    </Col>

                                    {/* select fields */}
                                    <Col md={6}>
                                        <Form.Label className="form-label mg-b-10 text-dark">
                                            {t("User.roleIds")}
                                            <span className="text-danger">*</span>
                                        </Form.Label>

                                        <Form.Select
                                            style={{ height: "50px" }}
                                            {...register("roleIds", {
                                                required: true,
                                            })}
                                        >
                                            <option value="" disabled selected>
                                                {t("CommonBtn.placeholder")}
                                            </option>
                                            {roleData?.map((item, index) => (
                                                <option key={index} value={item?.id}>
                                                    {item?.displayNameBn}
                                                    {/* {item?.name} */}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {errors?.roleIds?.type === "required" && (
                                            <span
                                                className="text-danger"
                                                style={{ fontSize: "16px" }}
                                            >
                                                {i18n.language === "en"
                                                    ? "Required "
                                                    : "এই তথ্যটি আবশ্যক"}
                                            </span>
                                        )}
                                    </Col>

                                    <Col md={6}>
                                        <Form.Label className="form-label mg-b-10 text-dark">
                                            {t("User.designationId")}
                                            <span className="text-danger">*</span>
                                        </Form.Label>

                                        <Form.Select
                                            style={{ height: "50px" }}
                                            {...register("designationId", {
                                                required: true,
                                            })}
                                        >
                                            <option value="" disabled selected>
                                                {t("CommonBtn.placeholder")}
                                            </option>
                                            {designation?.content?.map((item, index) => (
                                                <option key={index} value={item?.id}>
                                                    {item?.nameBn}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {errors?.designationId?.type === "required" && (
                                            <span
                                                className="text-danger"
                                                style={{ fontSize: "16px" }}
                                            >
                                                {i18n.language === "en"
                                                    ? "Required "
                                                    : "এই তথ্যটি আবশ্যক"}
                                            </span>
                                        )}
                                    </Col>

                                    {/* data  */}

                                    <Col md={6}>
                                        <Form.Label className="form-label mg-b-10 text-dark">
                                            {t("User.hierarchyId")}
                                            <span className="text-danger">*</span>
                                        </Form.Label>

                                        <Form.Select
                                            style={{ height: "50px" }}
                                            {...register("hierarchyId", {
                                                required: true,
                                            })}
                                            onChange={(event) =>
                                                handleHierarchyChange(event.target.value)
                                            }
                                        >
                                            <option disabled selected value="">
                                                {t("CommonBtn.placeholder")}
                                            </option>
                                            {hierarchy?.content?.map((item, index) => (
                                                <option key={index} value={item?.id}>
                                                    {item?.nameBn}{" "}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {errors?.hierarchyId?.type === "required" && (
                                            <span
                                                className="text-danger"
                                                style={{ fontSize: "16px" }}
                                            >
                                                {i18n.language === "en"
                                                    ? "Required "
                                                    : "এই তথ্যটি আবশ্যক"}
                                            </span>
                                        )}
                                    </Col>

                                    <Col md={6}>
                                        <Form.Label className="form-label mg-b-10 text-dark">
                                            {t("User.organizationId")}
                                            <span className="text-danger">*</span>
                                        </Form.Label>

                                        <Form.Select
                                            style={{ height: "50px" }}
                                            {...register("organizationId", {
                                                // required: true,
                                            })}
                                        >
                                            <option
                                                value={
                                                    updateUserData?.organization?.id
                                                        ? updateUserData?.organization?.id
                                                        : ""
                                                }
                                                selected
                                            >
                                                {updateUserData?.organization?.id
                                                    ? higherOffice?.map(
                                                        (item, index) =>
                                                            item?.id ===
                                                            updateUserData?.organization?.id && (
                                                                <option key={index} value={item?.id}>
                                                                    {item?.nameBn}
                                                                </option>
                                                            )
                                                    )
                                                    : t("CommonBtn.placeholder")}
                                            </option>

                                            {/* 
                                            <option value="" disabled selected>
                                                {t("CommonBtn.placeholder")}
                                            </option> */}

                                            {higherOffice?.map((item, index) => (
                                                <option key={index} value={item?.id}>
                                                    {i18n.language === "en" ? item?.nameEn : item?.nameBn}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {errors?.organizationId?.type === "required" && (
                                            <span
                                                className="text-danger"
                                                style={{ fontSize: "16px" }}
                                            >
                                                {i18n.language === "en"
                                                    ? "Required "
                                                    : "এই তথ্যটি আবশ্যক"}
                                            </span>
                                        )}
                                    </Col>

                                    <Col lg={6} md={6} sm={12} xs={12}>
                                        <Form.Label className="form-label mg-b-0 text-dark mb-2">
                                            {t("User.mobile")}
                                            <span className="text-danger">*</span>
                                        </Form.Label>

                                        <Form.Control
                                            as="input"
                                            placeholder={t("CommonBtn.placeholder2")}
                                            style={{ height: "50px" }}
                                            type="tel"
                                            {...register("mobile", {
                                                required: "Phone number is required",
                                                pattern: {
                                                    value: /^[0-9]{11}$/,
                                                    message: "Please enter a valid 11-digit phone number",
                                                },
                                            })}
                                        />

                                        {errors?.mobile && (
                                            <span
                                                className="text-danger"
                                                style={{ fontSize: "16px" }}
                                            >
                                                {i18n.language === "en"
                                                    ? errors?.mobile?.message
                                                    : "অনুগ্রহ করে একটি ১১-সংখ্যার ফোন নম্বর লিখুন"}
                                            </span>
                                        )}
                                    </Col>

                                    <Col lg={6} md={6} sm={12} xs={12}>
                                        <Form.Label className="form-label mg-b-0 text-dark mb-2">
                                            {t("User.phone")}
                                            <span className="text-danger">*</span>
                                        </Form.Label>

                                        <Form.Control
                                            as="input"
                                            placeholder={t("CommonBtn.placeholder2")}
                                            style={{ height: "50px" }}
                                            type="tel"
                                            {...register("phone", {
                                                required: "Phone number is required",
                                                pattern: {
                                                    value: /^[0-9]{11}$/,
                                                    message: "Please enter a valid 11-digit phone number",
                                                },
                                            })}
                                        />

                                        {errors?.phone && (
                                            <span
                                                className="text-danger"
                                                style={{ fontSize: "16px" }}
                                            >
                                                {i18n.language === "en"
                                                    ? errors?.phone?.message
                                                    : "অনুগ্রহ করে একটি ১১-সংখ্যার ফোন নম্বর লিখুন"}
                                            </span>
                                        )}
                                    </Col>

                                    <Col lg={6} md={6} sm={12} xs={12}>
                                        <Form.Label className="form-label mg-b-0  text-dark mb-2">
                                            {t("User.password")}
                                            <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Col md={12} className="d-flex">
                                            <Form.Control
                                                as="input"
                                                placeholder={t("CommonBtn.placeholder2")}
                                                style={{ height: "50px" }}
                                                type={showPass1 ? "text" : "password"}
                                                {...register("password", {
                                                    required: "Password is required",
                                                    pattern: {
                                                        value:
                                                            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()]).{8,}$/,
                                                        message:
                                                            "Password must have at least 8 characters, one number, one capital letter, and one special character",
                                                    },
                                                })}
                                            />
                                            <Button
                                                className="btn btn-white"
                                                onClick={() => setShowPass1(!showPass1)}
                                            >
                                                {showPass1 ? (
                                                    <i className="fe fe-eye text-dark"></i>
                                                ) : (
                                                    <i className="fe fe-eye-off text-dark"></i>
                                                )}
                                            </Button>
                                        </Col>

                                        {errors?.password && (
                                            <span
                                                className="text-danger"
                                                style={{ fontSize: "16px" }}
                                            >
                                                {i18n.language === "en"
                                                    ? errors?.password?.message
                                                    : "পাসওয়ার্ডে কমপক্ষে ৮টি অক্ষর, একটি সংখ্যা, একটি বড় অক্ষর এবং একটি বিশেষ অক্ষর থাকতে হবে"}
                                            </span>
                                        )}
                                    </Col>

                                    <Col lg={6} md={6} sm={12} xs={12}>
                                        <Form.Label className="form-label mg-b-0  text-dark mb-2">
                                            {t("User.confirmPass")}
                                            <span className="text-danger">*</span>
                                        </Form.Label>

                                        <Col md={12} className="d-flex">
                                            <Form.Control
                                                as="input"
                                                placeholder={t("CommonBtn.placeholder2")}
                                                style={{ height: "50px" }}
                                                type={showPass2 ? "text" : "password"}
                                                {...register("confirmPass", {
                                                    required: "Password is required",
                                                    pattern: {
                                                        value:
                                                            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()]).{8,}$/,
                                                        message:
                                                            "Password must have at least 8 characters, one number, one capital letter, and one special character",
                                                    },
                                                })}
                                            />
                                            <Button
                                                className="btn btn-white"
                                                onClick={() => setShowPass2(!showPass2)}
                                            >
                                                {showPass2 ? (
                                                    <i className="fe fe-eye text-dark"></i>
                                                ) : (
                                                    <i className="fe fe-eye-off text-dark"></i>
                                                )}
                                            </Button>
                                        </Col>
                                        {errors?.confirmPass && (
                                            <span
                                                className="text-danger"
                                                style={{ fontSize: "16px" }}
                                            >
                                                {i18n.language === "en"
                                                    ? errors?.confirmPass?.message
                                                    : "পাসওয়ার্ডে কমপক্ষে ৮টি অক্ষর, একটি সংখ্যা, একটি বড় অক্ষর এবং একটি বিশেষ অক্ষর থাকতে হবে"}
                                            </span>
                                        )}
                                    </Col>

                                    <Col lg={6} md={6} sm={12} xs={12}>
                                        <Form.Label className="form-label mg-b-0 text-dark mb-2">
                                            {t("User.email")}
                                            <span className="text-danger">*</span>
                                        </Form.Label>

                                        <Form.Control
                                            as="input"
                                            placeholder={t("CommonBtn.placeholder2")} // Placeholder for email
                                            style={{ height: "50px" }}
                                            type="email" // Set the input type to "email"
                                            {...register("email", {
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[a-zA-Z0-9._-]+@gmail\.com$/, // Regular expression for Gmail addresses
                                                    message:
                                                        "Please enter a valid Gmail address (example: user@gmail.com)",
                                                },
                                            })}
                                        />

                                        {errors?.email && (
                                            <span
                                                className="text-danger"
                                                style={{ fontSize: "16px" }}
                                            >
                                                {i18n.language === "en"
                                                    ? errors?.email?.message
                                                    : "অনুগ্রহ করে একটি বৈধ ইমেইল লিখুন (উদাহরণ: user@gmail.com)"}
                                            </span>
                                        )}
                                    </Col>

                                    {/* img upload  */}
                                    <Col md={4} className=" mg-t-5 mg-md-t-0">
                                        <Form.Label className="form-label mg-b-10 text-dark">
                                            {t("User.signature")}{" "}
                                        </Form.Label>
                                        <Form.Control
                                            id="file"
                                            type="file"
                                            name="documentUrl"
                                            onChange={(e) => handleChangeFile(e)}
                                        />
                                    </Col>

                                    {updateUserData?.signatureName && (
                                        <Col md={2} className="text-center mt-5">
                                            <img
                                                className="img-thumbnail"
                                                style={{}}
                                                src={`https://apams-api.babl.xyz/core-module/api/v1/file-storages/${updateUserData?.signatureName}`}
                                                alt="Default"
                                            />
                                            <p>{updateUserData?.signatureName}</p>
                                        </Col>
                                    )}

                                    <Col md={6} className="mg-t-5 mg-md-t-0">
                                        <Form.Label className="form-label mg-b-0">
                                            {t("CommonBtn.status")}{" "}
                                            <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Check
                                            inline
                                            label={t("CommonBtn.active")}
                                            {...register("statusId", { required: true })}
                                            type="radio"
                                            value={1}
                                            checked={true}
                                        />
                                        <Form.Check
                                            inline
                                            label={t("CommonBtn.inactive")}
                                            {...register("statusId", { required: true })}
                                            type="radio"
                                            value={2}
                                        />

                                        {errors?.statusId?.type === "required" && (
                                            <span
                                                className="text-danger"
                                                style={{ fontSize: "16px" }}
                                            >
                                                <br />{" "}
                                                {i18n.language === "en"
                                                    ? " Required"
                                                    : "এই তথ্যটি আবশ্যক"}
                                            </span>
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button
                                variant=""
                                className="btn btn-secondary  mg-r-5 pd-x-30 mg-t-5"
                                onClick={handleCloseModal}
                            >
                                {t("CommonBtn.close")}
                            </Button>

                            <Button
                                variant=""
                                type="submit"
                                className="btn btn-primary pd-x-30 mg-r-5 mg-t-5"
                            >
                                {btnState === "add"
                                    ? t("CommonBtn.create")
                                    : t("CommonBtn.create")}
                            </Button>
                        </Modal.Footer>
                    </form>
                </Modal>
            </Col>
        </div>
    );
};

export default UserModal;

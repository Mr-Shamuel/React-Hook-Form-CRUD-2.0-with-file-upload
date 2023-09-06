import {
  Col,
  Row,
  Card,
  Button,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { t } from "i18next";
import i18next from "i18next";
import { useState } from "react";
import UserModal from "./UserModal";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { CommonTable } from "../../../Common/CommonTable/CommonTable";
import Tokenvalidation from "../../../Authentication/Tokenvalidation";
import { getUserData } from "../../../Redux/Actions/SubordinateOffice/User/UserAction";
import { convertToBanglaNumerals } from "../../../Common/CommonFunctions/ConvertBnToEN";

const User = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.userData);
  const [showModal, setShowModal] = useState(false);
  const [tabledata, setTabledata] = useState([]);
  const [btnState, setBtnState] = useState("add");
  const [updateUserData, setUpdateUserData] = useState({});

  const {
    reset,
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    Tokenvalidation();
    dispatch(getUserData());
  }, [dispatch]);

  const COLUMNS = [
    {
      Header: `${t("CommonBtn.si_no")}`, //sometimes got undefine
      accessor: "Sl_No",
      className: "text-center ",
    },

    {
      Header: `${t("User.firstName")}`,
      accessor: "firstName",
      className: "text-center ",
    },
    {
      Header: `${t("User.userId")}`,
      accessor: "userId",
      className: "text-center ",
    },

    {
      Header: `${t("User.designationId")}`,
      accessor: "designationId",
      className: "text-center ",
    },
    {
      Header: `${t("User.roleIds")}`,
      accessor: "roleIds",
      className: "text-center ",
    },
    {
      Header: `${t("User.hierarchyId")}`,
      accessor: "hierarchyId",
      className: "text-center ",
    },
    {
      Header: `${t("User.organizationId")}`,
      accessor: "organizationId",
      className: "text-center ",
    },
    {
      Header: `${t("User.mobile")}`,
      accessor: "mobile",
      className: "text-center ",
    },
    {
      Header: `${t("User.phone")}`,
      accessor: "phone",
      className: "text-center ",
    },
    {
      Header: `${t("User.email")}`,
      accessor: "email",
      className: "text-center ",
    },

    // {
    //     Header: `${t("Office.status")}`,
    //     accessor: "status",
    //     className: "text-center ",
    // },

    {
      Header: `${t("CommonBtn.action")}`,
      accessor: "Action",
      className: "text-center ",
    },
  ];

  useEffect(() => {
    const alldata = userData?.map((item, index) => ({
      // Sl_No: item?.id,
      Sl_No:
        i18next.language === "en"
          ? index + 1
          : convertToBanglaNumerals(index + 1),
      firstName: item?.firstName,
      userId: item?.userId,
      designationId: item?.designation?.nameBn,
      roleIds: item?.role?.displayNameBn,
      hierarchyId: item?.hierarchy?.nameBn,
      organizationId: item?.organization?.nameBn,
      mobile: item?.mobile,
      phone: item?.phone,
      email: item?.email,
      Action: (
        <span className="">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{t("NoticeType.edit")} </Tooltip>}
          >
            <button
              onClick={() => EditModal(item)}
              to="#"
              className="btn btn-primary btn-sm rounded-11 me-2"
            >
              <i>
                <svg
                  className="table-edit"
                  xmlns="http://www.w3.org/2000/svg"
                  height="20"
                  viewBox="0 0 24 24"
                  width="16"
                >
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19zM20.71 5.63l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41z" />
                </svg>
              </i>
            </button>
          </OverlayTrigger>
        </span>
      ),
    }));
    setTabledata(alldata);
  }, [userData]);

  const handleOpenModal = () => {
    setUpdateUserData({});
    reset(updateUserData);
    setShowModal(true);
    setBtnState("add");
  };

  const EditModal = (item) => {
    setUpdateUserData(item);
    setBtnState("update");
    setShowModal(true);
  };

  // const handleDelete = (item) => {

  // };

  return (
    <div className="main-container container">
      <Card.Header>
        <div className="d-flex justify-content-between">
          <h4 className="card-title "> {t("User.header")}</h4>
          <Button onClick={handleOpenModal}>
            {t("CommonBtn.add")} <i className="fa fa-plus"></i>{" "}
          </Button>
        </div>
      </Card.Header>

      <Row>
        <Col lg={12}>
          <Card className="custom-card">
            <Card.Body>
              <div className="table-responsive fileexport pos-relative">
                {tabledata?.length > 0 ? (
                  <CommonTable
                    DATATABLE={tabledata}
                    COLUMNS={COLUMNS}
                    filter={true}
                    sortBy={true}
                    pagination={true}
                  />
                ) : (
                  <div className="text-center">Data not found...</div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <UserModal
        setShowModal={setShowModal}
        showModal={showModal}
        btnState={btnState}
        setBtnState={setBtnState}
        updateUserData={updateUserData}
        setUpdateUserData={setUpdateUserData}
        register={register}
        handleSubmit={handleSubmit}
        reset={reset}
        errors={errors}
        // setValue={setValue}
      />
    </div>
  );
};

export default User;

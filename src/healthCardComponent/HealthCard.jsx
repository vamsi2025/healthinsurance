// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import Webcam from "react-webcam";
// import {
//   Upload,
//   Button,
//   Spin,
//   Alert,
//   Typography,
//   Table,
//   Card,
//   Modal,
//   Row,
//   Col,
// } from "antd";
// import { UploadOutlined, CameraOutlined } from "@ant-design/icons";

// const { Title, Text } = Typography;

// function HealthCard() {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [documentData, setDocumentData] = useState(null);
//   const [polling, setPolling] = useState(false);
//   const [pollingInterval, setPollingInterval] = useState(null);
//   const [isCameraOpen, setIsCameraOpen] = useState(false);
//   const [cameraFacingMode, setCameraFacingMode] = useState("user"); // Front camera by default
//   const webcamRef = useRef(null);

//   const handleFileChange = (info) => {
//     setFile(info.file);
//   };

//   const handleSubmit = async () => {
//     const token = process.env.REACT_APP_API_TOKEN;
//     const apiUrl = process.env.REACT_APP_API_URL;

//     if (!token || !file) {
//       setError("API token or file is missing.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setDocumentData(null);

//     const formData = new FormData();
//     formData.append("document", file);

//     try {
//       const response = await axios.post(apiUrl, formData, {
//         headers: {
//           Authorization: `Token ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       const jobId = response.data?.job?.id || response.data?.job_id;
//       if (jobId) {
//         startPolling(jobId);
//       } else {
//         setError("No job ID returned from the API.");
//         setLoading(false);
//       }
//     } catch (err) {
//       setError("An error occurred while uploading the image.");
//       setLoading(false);
//     }
//   };

//   const startPolling = (jobId) => {
//     setPolling(true);
//     const intervalId = setInterval(async () => {
//       const token = process.env.REACT_APP_API_TOKEN;
//       const documentUrl = `${process.env.REACT_APP_GET_API_URL}/${jobId}`;

//       try {
//         const response = await axios.get(documentUrl, {
//           headers: {
//             Authorization: `Token ${token}`,
//           },
//         });
//         if (response.data?.document) {
//           setDocumentData(response.data.document.inference?.prediction);
//           clearInterval(intervalId);
//           setPolling(false);
//           setLoading(false);
//         }
//       } catch (err) {
//         setError("Failed to fetch document data.");
//       }
//     }, 5000);

//     setPollingInterval(intervalId);
//   };

//   useEffect(() => {
//     return () => {
//       if (pollingInterval) {
//         clearInterval(pollingInterval);
//       }
//     };
//   }, [pollingInterval]);

//   // Capture image from webcam
//   const captureImage = () => {
//     const imageSrc = webcamRef.current.getScreenshot();
//     fetch(imageSrc)
//       .then((res) => res.blob())
//       .then((blob) => {
//         const file = new File([blob], "captured_image.jpg", {
//           type: "image/jpeg",
//         });
//         setFile(file);
//         setIsCameraOpen(false);
//       });
//   };

//   const columns = [
//     {
//       title: "Field",
//       dataIndex: "field",
//       key: "field",
//       width: "50%",
//       render: (text) => <Text strong>{text}</Text>,
//     },
//     {
//       title: "Value",
//       dataIndex: "value",
//       key: "value",
//       width: "50%",
//       render: (text) => <Text>{text}</Text>,
//     },
//   ];

//   const tableData = documentData
//     ? Object.entries(documentData)
//         .map(([key, value], index) =>
//           value?.value
//             ? { key: index, field: key.replace(/_/g, " "), value: value.value }
//             : null
//         )
//         .filter(Boolean)
//     : [];

//   return (
//     <Card
//       title={
//         <Title level={3} style={{ margin: 0, textAlign: "center" }}>
//           Healthcare Card Uploader
//         </Title>
//       }
//       style={{
//         width: "100%",
//         maxWidth: "600px", // Limited max width for larger screens
//         margin: "40px auto",
//         padding: 24,
//         borderRadius: 12,
//         boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
//         background: "#f8f9fa",
//       }}
//     >
//       <Row gutter={[16, 16]}>
//         <Col span={24}>
//           <Upload
//             beforeUpload={() => false}
//             onChange={handleFileChange}
//             showUploadList={true}
//             style={{ width: "100%" }}
//           >
//             <Button
//               icon={<UploadOutlined />}
//               style={{
//                 width: "100%",
//                 background: "#1890ff",
//                 color: "white",
//                 borderRadius: 6,
//               }}
//             >
//               Select Healthcare Card Image
//             </Button>
//           </Upload>
//         </Col>

//         <Col span={24}>
//           <Button
//             icon={<CameraOutlined />}
//             style={{
//               width: "100%",
//               borderRadius: 6,
//               background: "#52c41a",
//               color: "white",
//             }}
//             onClick={() => setIsCameraOpen(true)}
//           >
//             Scan Healthcare Card
//           </Button>
//         </Col>

//         <Col span={24}>
//           <Button
//             type="primary"
//             onClick={handleSubmit}
//             loading={loading}
//             style={{
//               width: "100%",
//               borderRadius: 6,
//             }}
//           >
//             Upload Healthcare Card
//           </Button>
//         </Col>
//       </Row>

//       {error && (
//         <Alert message={error} type="error" style={{ marginTop: 16 }} />
//       )}

//       {polling && (
//         <div style={{ marginTop: 16, textAlign: "center" }}>
//           <Spin size="large" />
//           <Text>Processing document, please wait...</Text>
//         </div>
//       )}

//       {documentData && (
//         <div
//           style={{
//             marginTop: 16,
//             padding: 20,
//             background: "#ffffff",
//             borderRadius: 10,
//             boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//           }}
//         >
//           <Title level={4} style={{ textAlign: "center", marginBottom: 16 }}>
//             Document Details
//           </Title>
//           <Table
//             columns={columns}
//             dataSource={tableData}
//             pagination={false}
//             style={{ marginTop: 16 }}
//           />
//         </div>
//       )}

//       {/* Camera Modal */}
//       <Modal
//         visible={isCameraOpen}
//         onCancel={() => setIsCameraOpen(false)}
//         footer={null}
//         centered
//         width={400}
//       >
//         <Webcam
//           audio={false}
//           ref={webcamRef}
//           screenshotFormat="image/jpeg"
//           videoConstraints={{
//             facingMode: cameraFacingMode, // Toggle between front and back camera
//           }}
//           style={{ width: "100%", borderRadius: 10 }}
//         />
//         <Button
//           type="primary"
//           onClick={captureImage}
//           style={{ marginTop: 16, width: "100%", borderRadius: 6 }}
//         >
//           Capture Image
//         </Button>
//         <Button
//           type="default"
//           onClick={() =>
//             setCameraFacingMode(
//               cameraFacingMode === "user" ? "environment" : "user"
//             )
//           }
//           style={{ marginTop: 8, width: "100%", borderRadius: 6 }}
//         >
//           Switch Camera
//         </Button>
//       </Modal>
//     </Card>
//   );
// }

// export default HealthCard;

//with preview image
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import {
  Upload,
  Button,
  Spin,
  Alert,
  Typography,
  Table,
  Card,
  Modal,
  Row,
  Col,
} from "antd";
import { UploadOutlined, CameraOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function HealthCard() {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null); // Add file preview state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [documentData, setDocumentData] = useState(null);
  const [polling, setPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("user");
  const webcamRef = useRef(null);

  const handleFileChange = (info) => {
    const file = info.file;
    setFile(file);
    setFilePreview(URL.createObjectURL(file)); // Generate preview URL
  };

  const handleSubmit = async () => {
    const token = process.env.REACT_APP_API_TOKEN;
    const apiUrl = process.env.REACT_APP_API_URL;

    if (!token || !file) {
      setError("API token or file is missing.");
      return;
    }

    setLoading(true);
    setError("");
    setDocumentData(null);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const jobId = response.data?.job?.id || response.data?.job_id;
      if (jobId) {
        startPolling(jobId);
      } else {
        setError("No job ID returned from the API.");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred while uploading the image.");
      setLoading(false);
    }
  };

  const startPolling = (jobId) => {
    setPolling(true);
    const intervalId = setInterval(async () => {
      const token = process.env.REACT_APP_API_TOKEN;
      const documentUrl = `${process.env.REACT_APP_GET_API_URL}/${jobId}`;

      try {
        const response = await axios.get(documentUrl, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        if (response.data?.document) {
          setDocumentData(response.data.document.inference?.prediction);
          clearInterval(intervalId);
          setPolling(false);
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to fetch document data.");
      }
    }, 5000);

    setPollingInterval(intervalId);
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "captured_image.jpg", {
          type: "image/jpeg",
        });
        setFile(file);
        setFilePreview(URL.createObjectURL(file)); // Generate preview URL for captured image
        setIsCameraOpen(false);
      });
  };

  const columns = [
    {
      title: "Field",
      dataIndex: "field",
      key: "field",
      width: "50%",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      width: "50%",
      render: (text) => <Text>{text}</Text>,
    },
  ];

  const tableData = documentData
    ? Object.entries(documentData)
        .map(([key, value], index) =>
          value?.value
            ? { key: index, field: key.replace(/_/g, " "), value: value.value }
            : null
        )
        .filter(Boolean)
    : [];

  return (
    <Card
      title={
        <Title level={3} style={{ margin: 0, textAlign: "center" }}>
          Healthcare Card Uploader
        </Title>
      }
      style={{
        width: "100%",
        maxWidth: "600px",
        margin: "40px auto",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        background: "#f8f9fa",
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Upload
            beforeUpload={() => false}
            onChange={handleFileChange}
            showUploadList={true}
            style={{ width: "100%" }}
          >
            <Button
              icon={<UploadOutlined />}
              style={{
                width: "100%",
                background: "#1890ff",
                color: "white",
                borderRadius: 6,
              }}
            >
              Select Healthcare Card Image
            </Button>
          </Upload>
        </Col>

        <Col span={24}>
          <Button
            icon={<CameraOutlined />}
            style={{
              width: "100%",
              borderRadius: 6,
              background: "#52c41a",
              color: "white",
            }}
            onClick={() => setIsCameraOpen(true)}
          >
            Scan Healthcare Card
          </Button>
        </Col>

        <Col span={24}>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            style={{
              width: "100%",
              borderRadius: 6,
            }}
          >
            Upload Healthcare Card
          </Button>
        </Col>
      </Row>

      {filePreview && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <img
            src={filePreview}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "300px",
              borderRadius: 10,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          />
        </div>
      )}

      {error && <Alert message={error} type="error" style={{ marginTop: 16 }} />}

      {polling && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Spin size="large" />
          <Text>Processing document, please wait...</Text>
        </div>
      )}

      {documentData && (
        <div
          style={{
            marginTop: 16,
            padding: 20,
            background: "#ffffff",
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Title level={4} style={{ textAlign: "center", marginBottom: 16 }}>
            Document Details
          </Title>
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            style={{ marginTop: 16 }}
          />
        </div>
      )}

      <Modal
        visible={isCameraOpen}
        onCancel={() => setIsCameraOpen(false)}
        footer={null}
        centered
        width={400}
      >
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: cameraFacingMode,
          }}
          style={{ width: "100%", borderRadius: 10 }}
        />
        <Button
          type="primary"
          onClick={captureImage}
          style={{ marginTop: 16, width: "100%", borderRadius: 6 }}
        >
          Capture Image
        </Button>
        <Button
          type="default"
          onClick={() =>
            setCameraFacingMode(
              cameraFacingMode === "user" ? "environment" : "user"
            )
          }
          style={{ marginTop: 8, width: "100%", borderRadius: 6 }}
        >
          Switch Camera
        </Button>
      </Modal>
    </Card>
  );
}

export default HealthCard;


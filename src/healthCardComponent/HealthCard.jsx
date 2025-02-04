import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, Button, Spin, Alert, Typography, Table, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function HealthCard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [documentData, setDocumentData] = useState(null);
  const [polling, setPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  const handleFileChange = (info) => {
    setFile(info.file);
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

  const columns = [
    {
      title: "Field",
      dataIndex: "field",
      key: "field",
      width: "50%",
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      width: "50%",
      render: (text) => <Text>{text}</Text>
    }
  ];

  const tableData = documentData
    ? Object.entries(documentData).map(([key, value], index) =>
        value?.value ? { key: index, field: key.replace(/_/g, " "), value: value.value } : null
      ).filter(Boolean)
    : [];

  return (
    <Card 
      title={<Title level={3} style={{ margin: 0, textAlign: "center" }}>Healthcare Card Uploader</Title>} 
      style={{ 
        width: "50%", 
        margin: "40px auto", 
        padding: 24, 
        borderRadius: 12, 
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", 
        background: "#f8f9fa"
      }}
    >
      <Upload 
        beforeUpload={() => false} 
        onChange={handleFileChange} 
        showUploadList={true} 
        style={{ width: "100%" }}
      >
        <Button icon={<UploadOutlined />} style={{ width: "100%", background: "#1890ff", color: "white", borderRadius: 6 }}>
          Select Healthcare Card Image
        </Button>
      </Upload>
      <Button type="primary" onClick={handleSubmit} loading={loading} style={{ marginTop: 16, width: "100%", borderRadius: 6 }}>
        Upload Healthcare Card
      </Button>

      {error && <Alert message={error} type="error" style={{ marginTop: 16 }} />}

      {polling && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Spin size="large" />
          <Text>Processing document, please wait...</Text>
        </div>
      )}

      {documentData && (
        <div style={{ marginTop: 16, padding: 20, background: "#ffffff", borderRadius: 10, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
          <Title level={4} style={{ textAlign: "center", marginBottom: 16 }}>Document Details</Title>
          <Table columns={columns} dataSource={tableData} pagination={false} style={{ marginTop: 16 }} />
        </div>
      )}
    </Card>
  );
}

export default HealthCard;

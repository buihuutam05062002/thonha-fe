import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Navbar,
  Nav,
} from "react-bootstrap";
import logoImg from "../../assets/logo.png"; // Điều chỉnh path logo của bạn
import { Link, useNavigate } from "react-router-dom";

export default function LandingWorker() {
  const navigate = useNavigate();
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Header Landing Page */}
      <Navbar bg="white" expand="lg" className="border-bottom sticky-top py-3">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img
              src={logoImg}
              alt="Thợ Nhà"
              style={{ height: "40px", width: "auto", objectFit: "contain" }}
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="landing-navbar" />
          <Navbar.Collapse id="landing-navbar">
            <Nav className="ms-auto align-items-center gap-3">
              <Nav.Link href="#about" className="fw-semibold text-dark">
                Về chúng tôi
              </Nav.Link>
              <Nav.Link href="#benefits" className="fw-semibold text-dark">
                Quyền lợi
              </Nav.Link>
              <Nav.Link href="#process" className="fw-semibold text-dark">
                Quy trình
              </Nav.Link>
              <Button
                variant="outline-primary"
                className="fw-bold px-4 rounded-pill border-2"
                style={{ borderColor: "#F5820D", color: "#F5820D" }}
              >
                Đăng Nhập
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section className="py-5 bg-white border-bottom">
        <Container className="py-4">
          <Row className="align-items-center g-4">
            <Col lg={7}>
              <span
                className="badge px-3 py-2 rounded-pill mb-3 fw-semibold"
                style={{ backgroundColor: "#FFF4E6", color: "#F5820D" }}
              >
                Gia nhập cộng đồng 10.000+ Thợ Nhà
              </span>
              <h1 className="display-5 fw-bold text-dark mb-3">
                Tăng thu nhập thụ động & chủ động thời gian làm việc
              </h1>
              <p className="lead text-muted mb-4">
                Thợ Nhà kết nối bạn trực tiếp với hàng ngàn khách hàng có nhu
                cầu sửa chữa điện, nước, điện lạnh gần khu vực của bạn.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="fw-bold px-4 py-3 rounded-3 border-0 shadow-sm"
                  style={{ backgroundColor: "#F5820D", color: "#FFF" }}
                  onClick={() => navigate("/worker/register")}
                >
                  Đăng ký trở thành Thợ ngay →
                </Button>
              </div>
            </Col>
            <Col lg={5} className="text-center">
              <Card
                className="border-0 shadow-lg rounded-4 p-4 text-start"
                style={{ backgroundColor: "#FFF7ED" }}
              >
                <h5 className="fw-bold mb-3 text-dark">Ước tính thu nhập</h5>
                <div className="d-flex align-items-baseline gap-2 mb-2">
                  <span
                    className="display-6 fw-bold"
                    style={{ color: "#F5820D" }}
                  >
                    12 - 25 Triệu
                  </span>
                  <span className="text-muted fw-semibold">/ tháng</span>
                </div>
                <p className="small text-muted mb-0">
                  Nhận việc linh hoạt theo thời gian rảnh, nhận tiền ngay sau
                  khi hoàn thành công việc.
                </p>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-5">
        <Container className="py-4">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <h2 className="fw-bold text-dark">Tại sao nên chọn Thợ Nhà?</h2>
            <p className="text-muted">
              Chúng tôi cung cấp giải pháp toàn diện giúp bạn an tâm tác nghiệp
            </p>
          </div>

          <Row className="g-4">
            {[
              {
                title: "Thu nhập hấp dẫn",
                desc: "Nhận 100% thù lao ngay sau khi hoàn thành đơn hàng. Chiết khấu minh bạch.",
                icon: "💰",
              },
              {
                title: "Chủ động thời gian",
                desc: "Bật nhận việc khi rảnh, tắt khi bận. Bạn hoàn toàn làm chủ lịch trình.",
                icon: "⏰",
              },
              {
                title: "Đơn hàng liên tục",
                desc: "Hệ thống tự động điều phối đơn hàng gần vị trí của bạn nhất.",
                icon: "📍",
              },
              {
                title: "Hỗ trợ 24/7",
                desc: "Đội ngũ hỗ trợ giải quyết sự cố, bảo hiểm tai nạn lao động khi tác nghiệp.",
                icon: "🛡️",
              },
            ].map((item, idx) => (
              <Col key={idx} md={6} lg={3}>
                <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
                  <Card.Body>
                    <div className="fs-1 mb-3">{item.icon}</div>
                    <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
                    <p className="text-muted small mb-0">{item.desc}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-5 mt-auto" style={{ backgroundColor: "#1E293B" }}>
        <Container className="text-center text-white py-3">
          <h3 className="fw-bold mb-3">Sẵn sàng nâng cao thu nhập của bạn?</h3>
          <p className="text-white-50 mb-4">
            Chỉ mất 5 phút để hoàn tất hồ sơ đăng ký.
          </p>
          <Button
            size="lg"
            className="fw-bold px-5 py-3 rounded-3 border-0"
            style={{ backgroundColor: "#F5820D", color: "#FFF" }}
            onClick={() => navigate("/worker/register")}
          >
            Đăng ký hồ sơ ngay
          </Button>
        </Container>
      </section>
    </div>
  );
}

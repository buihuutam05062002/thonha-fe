import React from "react";
import { Row, Col, Badge } from "react-bootstrap";
import { StatCard } from "./StatCard";
import { StarRating } from "../../ui/StarRating";


export function OverviewStats() {
  return (
    <div className="mb-4">
      <h6
        className="text-muted text-uppercase fw-bold mb-3"
        style={{ fontSize: "11px", letterSpacing: "0.5px" }}
      >
        Tổng quan hôm nay
      </h6>
      <Row className="g-3">
        <Col xs={12} sm={4}>
          <StatCard
            value="5"
            label="Đơn hoàn thành · hôm nay"
            sub={
              <Badge
                bg="success"
                className="bg-opacity-10 text-success fw-semibold px-2 py-1"
              >
                hôm nay
              </Badge>
            }
          />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard
            value="850K"
            label="Thu nhập hôm nay (đ)"
            sub={<span className="fs-5">💵</span>}
          />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard
            value="4.8"
            label="Đánh giá trung bình"
            sub={<StarRating rating={4} />}
          />
        </Col>
      </Row>
    </div>
  );
}

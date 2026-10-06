import React from "react";
import { Row, Col, Badge } from "react-bootstrap";
import { StatCard } from "./StatCard";
import { StarRating } from "../../ui/StarRating";
import { formatMoney, formatMoneyShort } from "./format";

export function OverviewStats({ summary }) {
  const rating = Number(summary.averageRating ?? 0);
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
            value={summary.completedToday}
            label="Đơn hoàn thành hôm nay"
            sub={
              summary.ongoingJobs > 0 ? (
                <Badge bg="warning" className="bg-opacity-10 text-warning fw-semibold px-2 py-1">
                  {summary.ongoingJobs} đang làm
                </Badge>
              ) : null
            }
          />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard
            value={formatMoneyShort(summary.incomeToday)}
            label={`Thu nhập hôm nay · tuần này ${formatMoney(summary.incomeWeek)}`}
            sub={<span className="fs-5">💵</span>}
          />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard
            value={summary.reviewCount > 0 ? rating.toFixed(1) : "—"}
            label={
              summary.reviewCount > 0
                ? `${summary.reviewCount} đánh giá · nhận việc ${Number(summary.acceptanceRate ?? 0).toFixed(0)}%`
                : "Chưa có đánh giá"
            }
            sub={<StarRating rating={Math.round(rating)} />}
          />
        </Col>
      </Row>
    </div>
  );
}

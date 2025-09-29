package com.backend.domain.admin.order.dto;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public record AdminMergeableOrdersRequest(
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
) {}
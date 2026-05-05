package com.dunfang.bizhub.sales;

import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {

    private SalesOrder order;
    private List<SalesOrderItem> items;
}

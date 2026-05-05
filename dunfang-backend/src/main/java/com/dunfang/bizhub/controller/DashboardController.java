package com.dunfang.bizhub.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @GetMapping("/fake_analysis_chart_data")
    public Map<String, Object> getFakeChartData() {
        Map<String, Object> data = new HashMap<>();
        
        List<Map<String, Object>> visitData = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            Map<String, Object> item = new HashMap<>();
            item.put("x", "2024-05-" + (i + 1));
            item.put("y", Math.floor(Math.random() * 100) + 10);
            visitData.add(item);
        }
        
        data.put("visitData", visitData);
        data.put("salesData", new ArrayList<>());
        data.put("offlineData", new ArrayList<>());
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", data);
        return result;
    }

    @GetMapping("/tags")
    public Map<String, Object> getTags() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", new ArrayList<>());
        return result;
    }
}

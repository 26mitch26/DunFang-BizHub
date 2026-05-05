package com.dunfang.bizhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DunFangBizHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(DunFangBizHubApplication.class, args);
    }
}

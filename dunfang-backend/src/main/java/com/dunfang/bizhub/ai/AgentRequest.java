package com.dunfang.bizhub.ai;

import lombok.Data;

@Data
public class AgentRequest {
    private String question;
    private Object context;
}

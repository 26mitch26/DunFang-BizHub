package com.dunfang.bizhub.config;

import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.TenantLineInnerInterceptor;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.LongValue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

        // 配置多租户插件
        TenantLineInnerInterceptor tenantInterceptor = new TenantLineInnerInterceptor(new com.baomidou.mybatisplus.extension.plugins.handler.TenantLineHandler() {
            @Override
            public Expression getTenantId() {
                Long tenantId = TenantContextHolder.getTenantId();
                if (tenantId == null) {
                    // 如果上下文没有租户信息，可能是一些无需登录的接口或者系统任务，可以视业务而定。
                    // 为了防止全表扫描，默认可以给一个非常大的负数或者0，但这里我们根据白名单放行
                    return new LongValue(-1L); 
                }
                return new LongValue(tenantId);
            }

            @Override
            public String getTenantIdColumn() {
                return "company_id";
            }

            @Override
            public boolean ignoreTable(String tableName) {
                // 白名单：这些表不需要带上 company_id 隔离
                List<String> ignoreTables = Arrays.asList(
                        "sys_role",
                        "sys_role_permission",
                        "sys_user_role",
                        "company",
                        "sys_user" // 全局登录表，业务中查询用户需自行附带条件
                );
                return ignoreTables.contains(tableName);
            }
        });

        interceptor.addInnerInterceptor(tenantInterceptor);

        return interceptor;
    }
}

package com.dunfang.bizhub.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.TenantLineInnerInterceptor;

import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.LongValue;

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
                        "sys_user",
                        "brand",
                        "commission_rule",
                        "commission_record",
                        "sales_order_item"
                );
                return ignoreTables.contains(tableName);
            }
        });

        interceptor.addInnerInterceptor(tenantInterceptor);
        // 添加分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));

        return interceptor;
    }
}

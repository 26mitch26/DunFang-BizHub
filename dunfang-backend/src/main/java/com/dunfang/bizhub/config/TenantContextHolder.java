package com.dunfang.bizhub.config;

public class TenantContextHolder {
    private static final ThreadLocal<Long> TENANT_ID_HOLDER = new InheritableThreadLocal<>();

    public static void setTenantId(Long tenantId) {
        TENANT_ID_HOLDER.set(tenantId);
    }

    public static Long getTenantId() {
        return TENANT_ID_HOLDER.get();
    }

    public static void clear() {
        TENANT_ID_HOLDER.remove();
    }
}

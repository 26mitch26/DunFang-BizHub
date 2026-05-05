package com.dunfang.bizhub.customer;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dunfang.bizhub.common.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerMapper customerMapper;

    public IPage<Customer> page(int current, int size, Long companyId, String keyword) {
        LambdaQueryWrapper<Customer> wrapper = new LambdaQueryWrapper<>();
        if (companyId != null) {
            wrapper.eq(Customer::getCompanyId, companyId);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Customer::getName, keyword)
                    .or().like(Customer::getContactPerson, keyword));
        }
        wrapper.orderByDesc(Customer::getCreatedAt);
        return customerMapper.selectPage(new Page<>(current, size), wrapper);
    }

    public Customer getById(Long id) {
        Customer customer = customerMapper.selectById(id);
        if (customer == null) {
            throw new BizException(404, "Customer not found");
        }
        return customer;
    }

    public Customer create(Customer customer) {
        customerMapper.insert(customer);
        return customer;
    }

    public Customer update(Long id, Customer customer) {
        getById(id);
        customer.setId(id);
        customerMapper.updateById(customer);
        return customerMapper.selectById(id);
    }

    public void delete(Long id) {
        getById(id);
        customerMapper.deleteById(id);
    }
}

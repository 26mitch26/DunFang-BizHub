package com.dunfang.bizhub.customer;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.dunfang.bizhub.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public Result<IPage<Customer>> page(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) String keyword) {
        return Result.ok(customerService.page(current, size, companyId, keyword));
    }

    @GetMapping("/{id}")
    public Result<Customer> getById(@PathVariable Long id) {
        return Result.ok(customerService.getById(id));
    }

    @PostMapping
    public Result<Customer> create(@RequestBody Customer customer) {
        return Result.ok(customerService.create(customer));
    }

    @PutMapping("/{id}")
    public Result<Customer> update(@PathVariable Long id, @RequestBody Customer customer) {
        return Result.ok(customerService.update(id, customer));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return Result.ok();
    }
}

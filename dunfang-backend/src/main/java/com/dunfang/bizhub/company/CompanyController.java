package com.dunfang.bizhub.company;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.dunfang.bizhub.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public Result<IPage<Company>> page(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return Result.ok(companyService.page(current, size, keyword));
    }

    @GetMapping("/{id}")
    public Result<Company> getById(@PathVariable Long id) {
        return Result.ok(companyService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Company> create(@RequestBody Company company) {
        return Result.ok(companyService.create(company));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Company> update(@PathVariable Long id, @RequestBody Company company) {
        return Result.ok(companyService.update(id, company));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> delete(@PathVariable Long id) {
        companyService.delete(id);
        return Result.ok();
    }
}

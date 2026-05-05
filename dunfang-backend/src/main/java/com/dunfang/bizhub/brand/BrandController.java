package com.dunfang.bizhub.brand;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.dunfang.bizhub.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    public Result<IPage<Brand>> page(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return Result.ok(brandService.page(current, size, keyword));
    }

    @GetMapping("/all")
    public Result<List<Brand>> listAll() {
        return Result.ok(brandService.listAll());
    }

    @GetMapping("/{id}")
    public Result<Brand> getById(@PathVariable Long id) {
        return Result.ok(brandService.getById(id));
    }

    @PostMapping
    public Result<Brand> create(@RequestBody Brand brand) {
        return Result.ok(brandService.create(brand));
    }

    @PutMapping("/{id}")
    public Result<Brand> update(@PathVariable Long id, @RequestBody Brand brand) {
        return Result.ok(brandService.update(id, brand));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        brandService.delete(id);
        return Result.ok();
    }
}

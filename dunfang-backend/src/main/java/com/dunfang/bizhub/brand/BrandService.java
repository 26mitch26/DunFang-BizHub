package com.dunfang.bizhub.brand;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dunfang.bizhub.common.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandMapper brandMapper;

    public IPage<Brand> page(int current, int size, String keyword) {
        LambdaQueryWrapper<Brand> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Brand::getName, keyword);
        }
        wrapper.orderByDesc(Brand::getCreatedAt);
        return brandMapper.selectPage(new Page<>(current, size), wrapper);
    }

    public List<Brand> listAll() {
        return brandMapper.selectList(new LambdaQueryWrapper<Brand>().orderByAsc(Brand::getName));
    }

    public Brand getById(Long id) {
        Brand brand = brandMapper.selectById(id);
        if (brand == null) {
            throw new BizException(404, "Brand not found");
        }
        return brand;
    }

    public Brand create(Brand brand) {
        brandMapper.insert(brand);
        return brand;
    }

    public Brand update(Long id, Brand brand) {
        getById(id);
        brand.setId(id);
        brandMapper.updateById(brand);
        return brandMapper.selectById(id);
    }

    public void delete(Long id) {
        getById(id);
        brandMapper.deleteById(id);
    }
}

package com.dunfang.bizhub.company;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dunfang.bizhub.common.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyMapper companyMapper;

    public IPage<Company> page(int current, int size, String keyword) {
        LambdaQueryWrapper<Company> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Company::getName, keyword)
                    .or().like(Company::getShortName, keyword)
                    .or().like(Company::getTaxId, keyword);
        }
        wrapper.orderByDesc(Company::getCreatedAt);
        return companyMapper.selectPage(new Page<>(current, size), wrapper);
    }

    public Company getById(Long id) {
        Company company = companyMapper.selectById(id);
        if (company == null) {
            throw new BizException(404, "Company not found");
        }
        return company;
    }

    public Company create(Company company) {
        // Check tax_id uniqueness if provided
        if (StringUtils.hasText(company.getTaxId())) {
            Long count = companyMapper.selectCount(
                    new LambdaQueryWrapper<Company>().eq(Company::getTaxId, company.getTaxId()));
            if (count > 0) {
                throw new BizException(400, "Tax ID already exists");
            }
        }
        companyMapper.insert(company);
        return company;
    }

    public Company update(Long id, Company company) {
        Company existing = getById(id);
        company.setId(existing.getId());
        companyMapper.updateById(company);
        return companyMapper.selectById(id);
    }

    public void delete(Long id) {
        getById(id); // ensure exists
        companyMapper.deleteById(id);
    }
}

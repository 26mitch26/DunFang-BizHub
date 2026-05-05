package com.dunfang.bizhub.crm;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dunfang.bizhub.common.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowUpService {

    private final FollowUpMapper followUpMapper;

    public IPage<FollowUp> page(int current, int size, Long customerId) {
        LambdaQueryWrapper<FollowUp> wrapper = new LambdaQueryWrapper<>();
        if (customerId != null) {
            wrapper.eq(FollowUp::getCustomerId, customerId);
        }
        wrapper.orderByDesc(FollowUp::getCreatedAt);
        return followUpMapper.selectPage(new Page<>(current, size), wrapper);
    }

    public FollowUp getById(Long id) {
        FollowUp followUp = followUpMapper.selectById(id);
        if (followUp == null) {
            throw new BizException(404, "Follow-up record not found");
        }
        return followUp;
    }

    public FollowUp create(FollowUp followUp) {
        if (followUp.getCustomerId() == null) {
            throw new BizException(400, "Customer ID is required");
        }
        followUpMapper.insert(followUp);
        return followUp;
    }

    public FollowUp update(Long id, FollowUp followUp) {
        getById(id);
        followUp.setId(id);
        followUpMapper.updateById(followUp);
        return followUpMapper.selectById(id);
    }

    @Transactional
    public void delete(Long id) {
        followUpMapper.deleteById(id);
    }

    public List<FollowUp> getPendingFollowUps() {
        return followUpMapper.selectList(
                new LambdaQueryWrapper<FollowUp>()
                        .isNotNull(FollowUp::getNextFollowDate)
                        .le(FollowUp::getNextFollowDate, java.time.LocalDateTime.now())
                        .orderByAsc(FollowUp::getNextFollowDate));
    }
}

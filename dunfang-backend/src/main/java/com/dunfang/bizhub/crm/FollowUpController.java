package com.dunfang.bizhub.crm;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.dunfang.bizhub.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crm")
@RequiredArgsConstructor
public class FollowUpController {

    private final FollowUpService followUpService;

    @GetMapping("/follow-ups")
    public Result<IPage<FollowUp>> page(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long customerId) {
        return Result.ok(followUpService.page(current, size, customerId));
    }

    @GetMapping("/follow-ups/{id}")
    public Result<FollowUp> getById(@PathVariable Long id) {
        return Result.ok(followUpService.getById(id));
    }

    @PostMapping("/follow-ups")
    public Result<FollowUp> create(@RequestBody FollowUp followUp) {
        return Result.ok(followUpService.create(followUp));
    }

    @PutMapping("/follow-ups/{id}")
    public Result<FollowUp> update(@PathVariable Long id, @RequestBody FollowUp followUp) {
        return Result.ok(followUpService.update(id, followUp));
    }

    @DeleteMapping("/follow-ups/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        followUpService.delete(id);
        return Result.ok();
    }

    @GetMapping("/follow-ups/pending")
    public Result<List<FollowUp>> getPendingFollowUps() {
        return Result.ok(followUpService.getPendingFollowUps());
    }
}

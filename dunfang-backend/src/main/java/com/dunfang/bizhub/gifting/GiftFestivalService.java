package com.dunfang.bizhub.gifting;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nlf.calendar.Lunar;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class GiftFestivalService extends ServiceImpl<GiftFestivalMapper, GiftFestival> {

    /**
     * Calculate the next Gregorian date for a given festival.
     */
    public LocalDate getNextDate(GiftFestival festival) {
        if (!festival.getIsLunar()) {
            if (festival.getFestivalDate() != null) {
                LocalDate now = LocalDate.now();
                LocalDate next = festival.getFestivalDate().withYear(now.getYear());
                if (next.isBefore(now)) {
                    next = next.plusYears(1);
                }
                return next;
            }
            return null;
        } else {
            // Lunar calendar calculation
            LocalDate now = LocalDate.now();
            Lunar lunar = Lunar.fromDate(java.util.Date.from(now.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant()));
            int currentYear = lunar.getYear();
            
            // Try current lunar year
            Lunar targetLunar = Lunar.fromYmd(currentYear, festival.getLunarMonth(), festival.getLunarDay());
            LocalDate targetDate = LocalDate.of(
                targetLunar.getSolar().getYear(),
                targetLunar.getSolar().getMonth(),
                targetLunar.getSolar().getDay()
            );
            
            if (targetDate.isBefore(now)) {
                // Try next lunar year
                targetLunar = Lunar.fromYmd(currentYear + 1, festival.getLunarMonth(), festival.getLunarDay());
                targetDate = LocalDate.of(
                    targetLunar.getSolar().getYear(),
                    targetLunar.getSolar().getMonth(),
                    targetLunar.getSolar().getDay()
                );
            }
            return targetDate;
        }
    }
}

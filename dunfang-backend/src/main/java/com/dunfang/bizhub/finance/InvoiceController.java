package com.dunfang.bizhub.finance;

import com.dunfang.bizhub.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/parse")
    public Result<FinanceInvoice> parseInvoice(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-DashScope-Api-Key", required = false) String apiKey) {
        
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return Result.fail(400, "Missing X-DashScope-Api-Key in headers");
        }
        
        try {
            FinanceInvoice invoice = invoiceService.parseAndReconcile(file, apiKey);
            return Result.ok(invoice);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.fail(500, "Failed to parse invoice: " + e.getMessage());
        }
    }
}

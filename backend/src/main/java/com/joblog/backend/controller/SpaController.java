
package com.joblog.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
        "/dashboard",
        "/applications",
        "/applications/**",
        "/documents",
        "/interviews",
        "/analytics"
    })
    public String forwardToAngular() {
        return "forward:/index.html";
    }
}

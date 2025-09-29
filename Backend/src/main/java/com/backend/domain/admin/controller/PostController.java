package com.backend.domain.product.controller;

import com.backend.domain.product.entity.Post;
import com.backend.domain.product.service.PostService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/admin/products")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    record PostWriteForm(
            @NotBlank(message = "상품 이름을 입력해주세요.")
            String product_name,
            @NotBlank(message = "상품 가격을 입력해주세요.")
            Integer product_price,
            @NotBlank(message = "상품 재고를 입력해주세요.")
            Integer quantity,
            @NotBlank(message = "이미지 URL을 입력해주세요.")
            String image_url,
            @NotBlank(message = "상품 상세를 입력해주세요.")
            String description
    ) {}

    record PostModifyForm(
            @NotBlank(message = "상품 이름을 입력해주세요.")
            String product_name,
            @NotBlank(message = "상품 가격을 입력해주세요.")
            Integer product_price,
            @NotBlank(message = "상품 재고를 입력해주세요.")
            Integer quantity,
            @NotBlank(message = "이미지 URL을 입력해주세요.")
            String image_url,
            @NotBlank(message = "상품 상세를 입력해주세요.")
            String description
    ) {}

    @GetMapping("/write")
    public String write(@ModelAttribute("form") PostWriteForm form) {
        return "admin/products/write";
    }

    @PostMapping("/write")
    public String doWrite(@ModelAttribute("form") @Valid PostWriteForm form, BindingResult bindingResult) {
        if(bindingResult.hasErrors()) {
            return "admin/products/write";
        }
        Post post = postService.write(form.product_name, form.product_price, form.quantity, form.image_url, form.description);
        return "redirect:/admin/products/" + post.getId();
    }

    @GetMapping("/{id}/modify")
    public String modify(@PathVariable Long id, Model model) {
        Post post = postService.findById(id).orElseThrow();
        PostModifyForm form = new PostModifyForm(post.getProduct_name(), post.getProduct_price(), post.getQuantity(), post.getImage_url(), post.getDescription());
        model.addAttribute("form", form);
        model.addAttribute("post", post);
        return "admin/products/modify";
    }

    @PutMapping("/{id}")
    @Transactional
    public String doModify(@PathVariable Long id, @ModelAttribute("form") @Valid PostModifyForm form, BindingResult bindingResult, Model model) {
        Post post = postService.findById(id).orElseThrow();
        if(bindingResult.hasErrors()) {
            model.addAttribute("post", post);
            return "admin/products/modify";
        }
        postService.modify(post, form.product_name, form.product_price, form.quantity, form.image_url, form.description);
        return "redirect:/admin/products/" + post.getId();
    }

    @DeleteMapping("/{id}")
    @Transactional
    public String doDelete(@PathVariable Long id) {
        Post post = postService.findById(id).orElseThrow();
        postService.delete(post);
        return "redirect:/admin/products";
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public String detail(@PathVariable Long id, Model model) {
        Post post = postService.findById(id).orElseThrow();
        model.addAttribute("post", post);
        return "admin/products/details";
    }

    @GetMapping
    @Transactional(readOnly = true)
    public String list(Model model) {
        List<Post> posts = postService.findAll();
        model.addAttribute("posts", posts);
        return "admin/products/list";
    }
}
package com.nextinqueue.server.security;

import com.nextinqueue.server.model.User;
import com.nextinqueue.server.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Public TMDB endpoints must never be blocked by JWT authentication.
        if (path.startsWith("/api/tmdb/")
                || path.equals("/api/users/register")
                || path.equals("/api/users/login")
                || path.equals("/api/users/forgot-password")
                || path.equals("/api/users/verify-otp")
                || path.equals("/api/users/reset-password")
                || "OPTIONS".equalsIgnoreCase(request.getMethod())) {

            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        // No token: continue normally.
        // Spring Security will decide whether the endpoint requires authentication.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {

            String email = jwtService.extractEmail(token);

            Optional<User> userOptional =
                    userRepository.findByEmail(email);

            if (userOptional.isPresent()) {

                User user = userOptional.get();

                if (jwtService.isTokenValid(token, user)) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user.getEmail(),
                                    null,
                                    Collections.emptyList()
                            );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (Exception e) { System.out.println("JWT ERROR: " + e.getClass().getName() + " - " + e.getMessage()); SecurityContextHolder.clearContext(); }

        filterChain.doFilter(request, response);
    }
}


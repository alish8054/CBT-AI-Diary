package com.diploma.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private static final String LOCAL_DEVELOPMENT_KEY = "local-development-key";
    private static final String TEST_KEY = "test-key";

    private final ChatClient.Builder chatClientBuilder;

    @Value("${spring.ai.openai.api-key:}")
    private String openAiApiKey;

    public String chat(String message) {
        String fallback = fallbackChat(message);
        if (!isOpenAiConfigured()) {
            return fallback;
        }

        return callOpenAi("""
                You are a CBT assistant for a mental health diary app.
                You are supportive, practical, and concise.
                You do not replace a psychologist and you do not diagnose.
                You receive only the current chat message. Do not assume access to diary, dream, mood, profile, psychologist, or other app data.
                If the user mentions immediate danger, self-harm, or harm to others, tell them to contact emergency support.
                Respond in the user's language.
                """, message, fallback);
    }

    public boolean isOpenAiConfigured() {
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            return false;
        }

        String normalized = openAiApiKey.trim().toLowerCase(Locale.ROOT);
        return !LOCAL_DEVELOPMENT_KEY.equals(normalized)
                && !TEST_KEY.equals(normalized)
                && !normalized.contains("your-api-key");
    }

    private String callOpenAi(String systemPrompt, String userPrompt, String fallback) {
        try {
            ChatClient chatClient = chatClientBuilder.build();
            Prompt prompt = new Prompt(List.of(
                    new SystemMessage(systemPrompt),
                    new UserMessage(userPrompt)
            ));

            String content = chatClient.prompt(prompt).call().content();
            return content == null || content.isBlank() ? fallback : content;
        } catch (Exception e) {
            return fallback;
        }
    }

    private String fallbackChat(String message) {
        String topic = message == null || message.isBlank()
                ? "your current situation"
                : "\"" + trimForFallback(message) + "\"";

        return """
                AI is running in local fallback mode because OPENAI_API_KEY is not configured.

                I do not have access to diary entries, dreams, mood, profile, psychologist data, or any other app data.
                I only see this chat text: %s

                Short CBT exercise:
                1. Name the emotion and rate its intensity from 0 to 10.
                2. Write the automatic thought that makes it stronger.
                3. Ask: what facts support this thought, and what facts go against it?
                4. Write a more balanced thought in 1-2 sentences.
                """.formatted(topic);
    }
    private String trimForFallback(String text) {
        String compact = text.trim().replaceAll("\\s+", " ");
        return compact.length() <= 120 ? compact : compact.substring(0, 117) + "...";
    }
}

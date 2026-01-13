package com.br.uvaproject.saasuntitled;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.context.annotation.Import;
import com.br.uvaproject.saasuntitled.config.SecurityConfigTest;

@SpringBootTest
@ActiveProfiles("test")
@Import(SecurityConfigTest.class)
class SaasUntitledApplicationTests {
	@Test
	void contextLoads() {
	}
}

package uniovi.tests.pageobjects;

import static org.junit.Assert.fail;

import org.junit.Test;
import org.openqa.selenium.WebDriver;

import uniovi.tests.util.SeleniumUtils;

public class PO_HomeView extends PO_NavView {
	/**
	 * Comprueba que se carga el saludo de bienvenida correctamente
	 */
	static public void checkWelcome(WebDriver driver, int language) {
		PO_View.checkElement(driver, "text", "Bienvenido a la página");
	}

	@Test
	void test() {
		fail("Not yet implemented");
	}

}

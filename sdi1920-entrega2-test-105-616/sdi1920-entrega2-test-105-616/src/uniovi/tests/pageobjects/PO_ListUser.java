package uniovi.tests.pageobjects;

import static org.junit.Assert.assertTrue;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import uniovi.tests.util.SeleniumUtils;

public class PO_ListUser extends PO_NavView{

	public static void fillForm(WebDriver driver, String searchp) {

		WebElement search = driver.findElement(By.name("busqueda"));
		search.click();
		search.clear();
		search.sendKeys(searchp);
		//Pulsar el boton de login.
		By boton = By.id("buscar");
		driver.findElement(boton).click();
		
	}
	public static void clickOption(WebDriver driver, String textOption, String criterio, String textoDestino) {
		// CLickamos en la opción de registro y esperamos a que se cargue el enlace de Registro.
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "@href", textOption, getTimeout());
		// Tiene que haber un sólo elemento.
		assertTrue(elementos.size() == 1);
		// Ahora lo clickamos
		elementos.get(0).click();
		// Esperamos a que sea visible un elemento concreto
		elementos = SeleniumUtils.EsperaCargaPagina(driver, criterio, textoDestino, getTimeout());
		// Tiene que haber un sólo elemento.
		//assertTrue(elementos.size() == 1);
	}
}

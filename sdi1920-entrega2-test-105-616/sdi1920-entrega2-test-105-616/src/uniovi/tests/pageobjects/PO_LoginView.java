package uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_LoginView {
	public static void fillForm(WebDriver driver, String emailp, String passwordp) {

		WebElement email = driver.findElement(By.name("email"));
		email.click();
		email.clear();
		email.sendKeys(emailp);
		WebElement password = driver.findElement(By.name("password"));
		password.click();
		password.clear();
		password.sendKeys(passwordp);
		//Pulsar el boton de login.
		By boton = By.id("btnAceptar");
		driver.findElement(boton).click();
		
	}
}

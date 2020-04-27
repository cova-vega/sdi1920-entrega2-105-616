package uniovi.tests;

import static org.junit.Assert.*;

import java.util.List;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.runners.MethodSorters;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;



import uniovi.tests.pageobjects.PO_HomeView;
import uniovi.tests.pageobjects.PO_ListUser;
import uniovi.tests.pageobjects.PO_LoginView;

import uniovi.tests.pageobjects.PO_RegisterView;
import uniovi.tests.pageobjects.PO_View;
import uniovi.tests.util.SeleniumUtils;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)

public class MySocialNetworkTest {

	static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver024 = "C:\\Users\\Cova\\Desktop\\PL-SDI-Sesio╠ün5-material\\geckodriver024win64.exe";

	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024);
	static String URL = "http://localhost:8081";

	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}

	// Antes de cada prueba se navega al URL home de la aplicaciÃ³nn
	@Before
	public void setUp() {
		driver.navigate().to(URL);
	}

	// DespuÃ©s de cada prueba se borran las cookies del navegador
	@After
	public void tearDown() {
		driver.manage().deleteAllCookies();
	}

	// Antes de la primera prueba
	@BeforeClass
	static public void begin() {
	}

	// Al finalizar la Ãºltima prueba
	@AfterClass
	static public void end() {
		// Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	// PR1.Registro de Usuario con datos validos
	@Test
	public void PR1() {
			driver.navigate().to(URL + "/registrarse");
	
	        // Rellenamos el formulario.
	        PO_RegisterView.fillForm(driver, "tejera@tejera.com", "Sergio", "Tejera", "123456", "123456");
	       
	        PO_HomeView.checkElement(driver, "text", "Registro realizado correctamente");
	       
		
	}

	// PR2.Registro de Usuario con datos invalidos (email vacÃ­o, nombre vacÃ­o,
	// apellidos vacÃ­os).
	@Test
	public void PR2() {
		//Voy a la pagina
		driver.navigate().to(URL + "/registrarse");
		// Rellenamos el formulario
		PO_RegisterView.fillForm(driver, "", "", "", "12345", "12345");
		// Comprobamos que no pasa nada porque es required a true
		// Seguimos en la misma pagina
		PO_View.checkElement(driver, "text", "Campos vacios");

	}

	// PR3.Registro de Usuario con datos invÃ¡lidos (repeticiÃ³n de contraseÃ±a
	// invÃ¡lida).
	@Test
	public void PR3() {
		driver.navigate().to(URL + "/registrarse");
		// Rellenamos el formulario
		PO_RegisterView.fillForm(driver,"juan@gmail.com", "Juan", "Fernandez", "12345", "123456");
		// Comprobamos que las contraseÃ±as no coinciden
		PO_View.checkElement(driver, "text", "Contraseñas no coinciden");
	}

	// PR4.Registro de Usuario con datos invÃ¡lidos (email existente).
	@Test
	public void PR4() {
		driver.navigate().to(URL + "/registrarse");
		// Rellenamos el formulario
		PO_RegisterView.fillForm(driver,"michu@michu.com", "Juan", "Fernandez", "12345", "12345");
		// Comprobamos que las contraseÃ±as no coinciden
		PO_View.checkElement(driver, "text", "Ya existe un usuario con este email.");
	}

	// PR5.Inicio de sesiÃ³n con datos vÃ¡lidos
	@Test
	public void PR5() {
		driver.navigate().to(URL + "/identificarse");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "michu@michu.com", "123456");
		// Comprobamos que entramos en la pagina privada del usuario
		PO_View.checkElement(driver, "text", "Usuario identificado");
		
		}

	// [Prueba6] Inicio de sesión con datos inválidos (usuario estándar, campo email y contraseña vacíos). 
	@Test
	public void PR6() {
		driver.navigate().to(URL + "/identificarse");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "", "");
		// Comprobamos que sale un error
		PO_View.checkElement(driver, "text", "Email o password incorrecto");
	
	}

	//[Prueba7] Inicio de sesión con datos inválidos (usuario estándar, email existente, pero contraseña incorrecta). 
	@Test
	public void PR7() {
		driver.navigate().to(URL + "/identificarse");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "michu@michu.com", "1234567");
		// Comprobamos que sale un error
		PO_View.checkElement(driver, "text", "Email o password incorrecto");

	}

	//[Prueba8] Inicio de sesión con datos inválidos (usuario estándar, email no existente y contraseña no vacía). 
	@Test
	public void PR8() {
		driver.navigate().to(URL + "/identificarse");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "michu@juan.com", "1234567");
		// Comprobamos que sale un error
		PO_View.checkElement(driver, "text", "Email o password incorrecto");

	}

	///[Prueba9] Hacer click en la opción de salir de sesión y comprobar que se redirige a la página de inicio de sesión (Login). [
	@Test
	public void PR9() {
		driver.navigate().to(URL + "/identificarse");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "michu@michu.com", "123456");
		// Comprobamos que entramos en la pagina privada del usuario
		PO_View.checkElement(driver, "text", "Usuario identificado");
		// Seleccionamos el boton de cerrar sesion
		PO_HomeView.clickOption(driver, "Desconectarse", "class", "glyphicon glyphicon-log-out");
		// Comprobamos que estamos en la pagina de login
		PO_View.checkElement(driver, "text", "Identificar usuario");

	}

	//[Prueba10] Comprobar que el botón cerrar sesión no está visible si el usuario no está autenticado. 
	@Test
	public void PR10() {
		driver.navigate().to(URL + "/identificarse");
		PO_HomeView.checkNoElement(driver, "Desconectarse");
	}
		
		

	// PR11.Mostrar el listado de usuarios y comprobar que se muestran todos los que
	// existen en el
	// sistema.
	@Test
	public void PR11() {
		driver.navigate().to(URL + "/identificarse");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "michu@michu.com", "123456");
		//Vamos a la lista de usuarios
		driver.navigate().to(URL + "/usuarios");
		// Primera pagina
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		assertTrue(elementos.size() == 5);
		driver.navigate().to("http://localhost:8081/usuarios?pg=1");
		// Segunda pagina
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());
		assertTrue(elementos.size() == 5);
		driver.navigate().to("http://localhost:8081/usuarios?pg=2");
		

	}

	//[Prueba12] Hacer una búsqueda con el campo vacío y
	//comprobar que se muestra la página que corresponde con el listado usuarios existentes en el sistema. 
	@Test
	public void PR12() {
		driver.navigate().to(URL + "/identificarse");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "michu@michu.com", "123456");
		//Vamos a la lista de usuarios
		driver.navigate().to(URL + "/usuarios");
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		assertTrue(elementos.size() == 5);
		// Busqueda
		driver.navigate().to("http://localhost:8081/usuarios?busqueda=");
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());
		assertTrue(elementos.size() == 5);

		driver.navigate().to("http://localhost:8081/usuarios?pg=1");
		// Ultima pagina
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());
		assertTrue(elementos.size() == 5);
		driver.navigate().to("http://localhost:8081/usuarios?pg=2");
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());

	}

	//[Prueba13] Hacer una búsqueda escribiendo en el campo un texto que no exista y 
	//comprobar que se muestra la página que corresponde, con la lista de usuarios vacía. 
	@Test
	public void PR13() {
		driver.navigate().to(URL + "/identificarse");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "michu@michu.com", "123456");
		PO_View.getP();
		//Vamos a la lista de usuarios
		driver.navigate().to(URL + "/usuarios");
		// Busqueda
		PO_ListUser.fillForm(driver, "cova");
		// Comprobamos que no esta en la busqueda
		SeleniumUtils.textoNoPresentePagina(driver, "cova");


	}

	//[Prueba14] Hacer una búsqueda con un texto específico y comprobar que se muestra la página que corresponde,
	//con la lista de usuarios en los que el texto especificados sea parte de su nombre, apellidos o de su email. 
	@Test
	public void PR14() {
		driver.navigate().to(URL + "/identificarse");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "michu@michu.com", "123456");
		PO_View.getP();
		//Vamos a la lista de usuarios
		driver.navigate().to(URL + "/usuarios");
		// Busqueda
		PO_ListUser.fillForm(driver, "ser");
		// Comprobamos que esta en la busqueda
		SeleniumUtils.textoPresentePagina(driver, "Sergio");
		
	}

	// [Prueba15] Desde el listado de usuarios de la aplicación, enviar una invitación de amistad a un usuario. 
	//Comprobar que la solicitud de amistad aparece en el listado de invitaciones (punto siguiente). 
	@Test
	public void PR15() {
		driver.navigate().to(URL + "/identificarse");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "michu@michu.com", "123456");
		PO_View.getP();
		//Vamos a la lista de usuarios
		driver.navigate().to(URL + "/usuarios");
		List<WebElement> elementos;
		
		
//		// Enviamos peticion
		
		PO_ListUser.clickOption(driver, "user/send/5", "text", "Agregar Amigo");
//		elementos = PO_View.checkElement(driver, "free","//td[contains(text(), 'Pelayo')]/following-sibling::*/a[contains(@href, '/user/send')]");
//		
//		elementos.get(0).click();
		// Nos desconectamos
		PO_HomeView.clickOption(driver, "logout", "class", "btn btn-primary");
		// Nos conectamos con el otro usuario
		PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "pelayo@gmail.com", "123456");
		// Vamos a la pestaÃ±a amigos
		driver.navigate().to("http://localhost:8090/user/request");
		
		// Comprobamos que hay una solicitud de el usuario ejemplo1: Pedro
		SeleniumUtils.textoPresentePagina(driver, "Pedro");
		// Nos desconectamos
		PO_HomeView.clickOption(driver, "logout", "class", "btn btn-primary");
	}

	// PR16.Desde el listado de usuarios de la aplicaciÃ³n, enviar una invitaciÃ³n de
	// amistad a un usuario al
	// que ya le habÃ­amos enviado la invitaciÃ³n previamente. No deberÃ­a dejarnos
	// enviar la invitaciÃ³n, se podrÃ­a
	// ocultar el botÃ³n de enviar invitaciÃ³n o notificar que ya habÃ­a sido enviada
	// previamente.
	@Test
	public void PR16() {
		
		// Vamos al formulario de logueo.
				PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
				// Rellenamos el formulario
				PO_LoginView.fillForm(driver, "pedro@gmail.com", "123456");
				PO_View.getP();
				// Vamos al menu de usuarios
				driver.navigate().to("http://localhost:8090/user/list");
				List<WebElement> elementos;
				
				
				
				
				try {
					PO_ListUser.clickOption(driver, "user/send/1", "text", "Agregar Amigo");
				}
				catch(org.openqa.selenium.TimeoutException t) {
					
					assertNotNull("No exite el enlace",t);
				}
					
				
				
				
				
				

	}

	//[Prueba17] Mostrar el listado de invitaciones de amistad recibidas.
	//Comprobar con un listado que contenga varias invitaciones recibidas.
	@Test
	public void PR17() {
		// Vamos al formulario de logueo.
				PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
				// Rellenamos el formulario
				PO_LoginView.fillForm(driver, "maria@gmail.com", "123456");
				PO_View.getP();
				// Vamos al menu de usuarios
				driver.navigate().to("http://localhost:8090/user/list");
				List<WebElement> elementos;
		
		
				// Enviamos peticion
				PO_ListUser.clickOption(driver, "user/send/1", "text", "Agregar Amigo");
				// Nos desconectamos
				PO_HomeView.clickOption(driver, "logout", "class", "btn btn-primary");
				
				
				PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
				// Rellenamos el formulario
				PO_LoginView.fillForm(driver, "pelayo@gmail.com", "123456");
				PO_View.getP();
				// Vamos al menu de usuarios
				driver.navigate().to("http://localhost:8090/user/list");
		
		
				// Enviamos peticion
				PO_ListUser.clickOption(driver, "user/send/1", "text", "Agregar Amigo");
				// Nos desconectamos
				PO_HomeView.clickOption(driver, "logout", "class", "btn btn-primary");
		
		
		
				PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
				// Rellenamos el formulario
				PO_LoginView.fillForm(driver, "lucas@gmail.com", "123456");
				PO_View.getP();
				// Vamos al menu de usuarios
				driver.navigate().to("http://localhost:8090/user/list");
		
		
				// Enviamos peticion
				PO_ListUser.clickOption(driver, "user/send/1", "text", "Agregar Amigo");
				// Nos desconectamos
				PO_HomeView.clickOption(driver, "logout", "class", "btn btn-primary");
		
		
		
		
		   // Vamos al formulario de logueo.
				PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
				// Rellenamos el formulario
				PO_LoginView.fillForm(driver, "pedro@gmail.com", "123456");
				PO_View.getP();
				// Vamos al menu de usuarios
				driver.navigate().to("http://localhost:8090/user/request");
				
				PO_View.checkElement(driver, "text", "Peticiones de amistad");
				
				List<WebElement> elementosLista = SeleniumUtils.EsperaCargaPagina(driver, "free","//tbody/tr", PO_View.getTimeout());
						assertTrue(elementosLista.size() == 3);
						//Ahora nos desconectamos
						PO_HomeView.clickOption(driver, "logout", "class", "btn btn-primary");
				

	}

	//[Prueba18] Sobre el listado de invitaciones recibidas. Hacer click en 
	//el botón/enlace de una de ellas y comprobar que dicha solicitud desaparece del listado de invitaciones. 
	@Test
	public void PR18() {
		
		// Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "maria@gmail.com", "123456");
		PO_View.getP();
		// Vamos al menu de usuarios
		driver.navigate().to("http://localhost:8090/user/list");
		List<WebElement> elementos;


		// Enviamos peticion
		PO_ListUser.clickOption(driver, "user/send/2", "text", "Agregar Amigo");
		// Nos desconectamos
		PO_HomeView.clickOption(driver, "logout", "class", "btn btn-primary");
		
		
		// Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "lucas@gmail.com", "123456");
		PO_View.getP();
		// Vamos al menu de usuarios
		driver.navigate().to("http://localhost:8090/user/request");
		
		PO_View.checkElement(driver, "text", "Peticiones de amistad");
		
		List<WebElement> elementosLista = SeleniumUtils.EsperaCargaPagina(driver, "free",
				"//tbody/tr", PO_View.getTimeout());
				assertTrue(elementosLista.size() == 1);
				
				elementos = PO_View.checkElement(driver, "free","//td[contains(text(), 'MarÃ­a')]/following-sibling::*/a[contains(@href, '/user/delete')]");
				elementos.get(0).click();
				
				PO_View.checkElement(driver, "text", "Amigos");
				
				driver.navigate().to("http://localhost:8090/user/request");
				
				PO_View.checkElement(driver, "text", "Peticiones de amistad");
				
				//Comprobamos que ya no existe la peticiÃ³n de MarÃ­a
				PO_View.checkNoElement(driver, "MarÃ­a");
				
				
				//Ahora nos desconectamos
				PO_HomeView.clickOption(driver, "logout", "class", "btn btn-primary");

	}

	//[Prueba19] Mostrar el listado de amigos de un usuario. 
	//Comprobar que el listado contiene los amigos que deben ser. 
	@Test
	public void PR19() {
		
		
		// Vamos al formulario de logueo.
				PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
				// Rellenamos el formulario
				PO_LoginView.fillForm(driver, "marta@gmail.com", "123456");
				PO_View.getP();
				// Vamos al menu de usuarios
				driver.navigate().to("http://localhost:8090/user/list");
				List<WebElement> elementos;


				// Enviamos peticion
				PO_ListUser.clickOption(driver, "user/send/1", "text", "Agregar Amigo");
				// Nos desconectamos
				PO_HomeView.clickOption(driver, "logout", "class", "btn btn-primary");
				
				
				// Vamos al formulario de logueo.
				PO_HomeView.clickOption(driver, "login", "class", "btn btn-primary");
				// Rellenamos el formulario
				PO_LoginView.fillForm(driver, "lucas@gmail.com", "123456");
				PO_View.getP();
				// Vamos al menu de usuarios
				driver.navigate().to("http://localhost:8090/user/request");
				
				PO_View.checkElement(driver, "text", "Peticiones de amistad");
				
				List<WebElement> elementosLista = SeleniumUtils.EsperaCargaPagina(driver, "free",
						"//tbody/tr", PO_View.getTimeout());
						assertTrue(elementosLista.size() == 1);
						
						PO_ListUser.clickOption(driver, "user/delete/4", "text", "Aceptar");
						
						driver.navigate().to("http://localhost:8090/user/friends");
						
						PO_View.checkElement(driver, "text", "Amigos");
						
						elementosLista = SeleniumUtils.EsperaCargaPagina(driver, "free","//tbody/tr", PO_View.getTimeout());

						assertTrue(elementosLista.size() == 2);
						
						//Ahora nos desconectamos
						PO_HomeView.clickOption(driver, "logout", "class", "btn btn-primary");

		

	}

	// PR20.[Prueba20] Intentar acceder sin estar autenticado a 
	//la opción de listado de usuarios. Se deberá volver al formulario de login
	@Test
	public void PR20() {
		driver.navigate().to(URL + "/usuarios");
		PO_View.checkNoElement(driver, "Lista Usuarios");
	}

	//[Prueba21]Intentar acceder sin estar autenticado a la opción de listado de invitaciones de amistad recibida 
	//de un usuario estándar. Se deberá volver al formulario de login

	@Test
	public void PR21() {
		driver.navigate().to(URL + "/invitaciones");
		PO_View.checkNoElement(driver, "Lista Invitaciones");
	}
	//[Prueba22] Intentar acceder estando autenticado como usuario 
	//standard a la lista de amigos de otro usuario. Se deberá mostrar un mensaje de acción indebida. 
	@Test
	public void PR22() {
		driver.navigate().to(URL + "/identificarse");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "michu@michu.com", "123456");
		// Comprobamos que entramos en la pagina privada del usuario
		PO_View.checkElement(driver, "text", "Usuario identificado");
		//Vamos a la lista de amigos de otro usuario
		driver.navigate().to(URL + "/amigos/");
		//Se muestra la opcion de prohibido
		assertTrue(driver.getTitle().toLowerCase().contains("forbidden"));
		
	}

	
}

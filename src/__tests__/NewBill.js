/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {ROUTES_PATH} from "../constants/routes.js";
import {ROUTES} from "../constants/routes.js";
import Store from "../app/Store";

// ------ Code repris du test Dashboard.js -------- //
jest.mock("../app/store", () => mockStore)
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({pathname});
};

// ------ On vérifie qu'on est connecté en tant qu'employé -------- //
describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: "a@a.com"
      })
    )
    Object.defineProperty(window, 'location', {
      value: {
        hash: ROUTES_PATH['NewBill']
      }
    })
  })
    // --- PARTIE 1 : on teste l'existence du formulaire ---- /
  describe('When I submit a new Bill on correct format', () => { 
    test('Then the submit should success', () => { 

      const html = NewBillUI()                                  //On récupère le HTML de NewBillUI pour pouvoir le tester
      document.body.innerHTML = html
      const newBill = new NewBill({                               //On crée une instance de NewBill
        document, 
        onNavigate, 
        localStorage: window.localStorage
      });
      const formNewBill = screen.getByTestId("form-new-bill")     // On récupère l'id du formulaire et on le met dans une variable
      expect(formNewBill).toBeTruthy()                            // On teste si le formulaire existe

    // --- PARTIE 2 : on teste la fonction d'envoi du formulaire ---- /
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e)) // On récupère la fonction handleSubmit
      formNewBill.addEventListener("submit", handleSubmit);       // On déclenche l'événement submit de l'envoi du formulaire
      fireEvent.submit(formNewBill);                             // On simule le déclenchement de l'événement submit de l'envoi du formulaire
      expect(handleSubmit).toHaveBeenCalled();                    // On teste si la fonction handleSubmit a bien été appelée
    })

   



    // ----------TESTS DE LA VÉRIFICATION DU FORMAT DE FICHIER ----------- /
  describe("When I upload a file", () => {
 
    describe("If the format is not correct", () => {
    test("Then the upload fail", () => {
      const html = NewBillUI()                    //On récupère le HTML de NewBillUI pour pouvoir le tester
      document.body.innerHTML = html
      const inputFile = screen.getByTestId("file")   //On récupère l'input du HTML via l'id "file"
      const newBill = new NewBill({             //On crée une instance de la class NewBill
        document,
        onNavigate,
        store: Store,
        localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn(newBill.handleChangeFile)    //On récupère la fonction qui vérifie le format de l'image
      inputFile.addEventListener("change", handleChangeFile)             //On déclenche un événement change sur l'input
      fireEvent.change(inputFile, {
        target: {
            files: [new File(["image"], "test.svg", {type: "image/svg"})]    // On veut tester le changement de format svg d'un fichier
        }
      })
      expect(inputFile.value).toBe('')                                    // On teste que la valeur renvoyée est bien nulle
    })
  })

  describe("If the format is correct", () => {
    test("Then the upload success", () => {  
      const html = NewBillUI()                    //On récupère le HTML de NewBillUI pour pouvoir le tester
      document.body.innerHTML = html
      const inputFile = screen.getByTestId("file")   //On récupère l'input du HTML via l'id "file"
      const newBill = new NewBill({             //On crée une instance de la class NewBill
        document,
        onNavigate,
        store: Store,
        localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn(newBill.handleChangeFile)          //On récupère la fonction qui vérifie le format de l'image
      inputFile.addEventListener("change", handleChangeFile)              // On appelle la fonction qui vérifie le format de fichier
      fireEvent.change(inputFile, { target: {                             // On teste ce qui se passe quand envoie un fichier jpg
        files: [new File(["image"], "file.jpg", {type: "image/jpg"})] 
      } })         
      expect(inputFile.files[0].name).toBe("file.jpg")                    // On teste que le nom du fichier soit bien file.jpg
    })
  })
  })
    // Test d'intégration POST
  describe("Given I am a user connected as Employee", () => {
    describe("When I navigate on New Bills page", () => {
      test("he will create a New Bill (post)", async () => {
        const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })  // Instance de NewBill
        // On crée un objet billMock avec des données aléatoires
        const billMock = {                  
          type: "Transports",
          name: "Frais de carburants",
          date: "2022-06-25",
          amount: 250,
          vat: 20,
          pct: 20,
          commentary: "Trajet en voiture par l'autoroute",
          fileUrl: "../images/carburant-1.jpg",
          fileName: "carburant-1.jpg",
          status: "pending"
        }
        // On assigne les valeurs du mock aux input du formulaire
        screen.getByTestId("expense-type").value = billMock.type   
        screen.getByTestId("expense-name").value = billMock.name
        screen.getByTestId("datepicker").value = billMock.date
        screen.getByTestId("amount").value = billMock.amount
        screen.getByTestId("vat").value = billMock.vat
        screen.getByTestId("pct").value = billMock.pct
        screen.getByTestId("commentary").value = billMock.commentary 
        newBill.fileName = billMock.fileName
        newBill.fileUrl = billMock.fileUrl
        newBill.updateBill = jest.fn()
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))        // On récupère la fonction de vérification du format d'image
        const form = screen.getByTestId("form-new-bill")                  // On récupère le formulaire dans une variable
        form.addEventListener("submit", handleSubmit)                   // On déclenche l'événement submit et on appelle la fonction handleSubmit
        fireEvent.submit(form)                                          // On teste l'événement submit sur le formulaire
        expect(handleSubmit).toHaveBeenCalled()                          // On vérifie que la fonction handleSubmit a bien été appelée
        expect(newBill.updateBill).toHaveBeenCalled()                 // On vérifie que updateBill a bien été appelée

      })
    })
     // ----------TESTS DES ERREURS 404 ET 500 repris du test Dashboard.js et Bills.js ----------- /

     describe('When an error occurs', () => { 
      test('should fail with 404 message error', async () => { 
          jest.spyOn(mockStore, "bills")
         
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();       })
    })
  })
  describe('When an error occurs', () => { 
      test('should fail with 500 message error', async () => { 
          jest.spyOn(mockStore, "bills")
          
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();       
      })
      })
    })
    
  })


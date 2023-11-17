/**
 * @jest-environment jsdom
 */
import $ from "jquery";
import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      
      expect(windowIcon.classList.contains('active-icon')).toBe(true) // ici on vérifie que windowIcon possède ENTRE AUTRES une Class "active-icon"

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => (new Date(b.date) - new Date(a.date))  // PROBLEME ICI, CHANGER :  (a < b) ? 1 : -1
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)

    })
  })
})





// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I am on Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" })); // On remplace Admin par Employee
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))   // On vérifie que ces textes sont bien affichés sur la page
     const tableActions  = await screen.getByText("Actions")
      expect(tableActions).toBeTruthy()
      const newBillButton  = await screen.getByText("Nouvelle note de frais")
      expect(newBillButton).toBeTruthy()
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("catch bills from an API and test 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
    })

    test("catch bills from an API and test 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
    })
  })

  })
})



// TEST DE LA NAVIGATION VERS NewBill à partir de Bills.js
describe("Given I am a user connected as Employee", () => {
  describe("When I am on Bills Page", () => {
    test("I click on the button called 'Nouvelle note de frais' and navigate to NewBill page", async () => {

      const onNavigate = jest.fn();   // On crée une fonction exploitable par Jest avec .fn()
      const bills = new Bills({       // On récupère l'instance de Bills pour avoir accès à onNavigate
        document,
        onNavigate
      });

      const createNewBillButton = screen.getByTestId("btn-new-bill");     // On récupère le bouton pour créer nouvelle facture
      fireEvent.click(createNewBillButton);                               // On met l'événement de clic

      // Vérification de la navigation vers NewBill
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);  // On vérifie que la route NewBill a bien été appelée
    });
  });
});





// TEST DU CLIC SUR L'ICONE DE L'OEIL
describe("Given I am a user connected as Employee", () => {
  describe("When I am on Bills Page", () => {
    test("I click on the eye icon and the function handleClickIconEye should be called", async () => {

      const modalMock = jest.fn();        // On crée une fonction jest pour tester la fonction modal() de Bills.js
      $.fn.modal = modalMock;

      document.body.innerHTML = `<div data-testid="icon-eye"></div>`; // On récupère la partie d'HTML qui nous intéresse avec l'oeil

      const bills = new Bills({         // On crée une instance de Bills
        document
      });

      const handleClickIconEyeSpy = jest.spyOn(bills, 'handleClickIconEye');  // On observe la fonction handleClickIconEye

      await waitFor(() => screen.getByTestId("icon-eye"));                  // On attend que l'icône de l'oeil ait chargé
      const iconEye = screen.getByTestId("icon-eye");                       // On met l'icône de l'oeil dans une variable

      fireEvent.click(iconEye);                                            // On déclenche le clic sur l'icône de l'oeil

      expect(handleClickIconEyeSpy).toHaveBeenCalled();                     // On vérifie que handleClickIconEye a été appelée
      expect(modalMock).toHaveBeenCalledWith("show");                       // On vérifie que modalMock a été appelée avec "show"

    });
  });
});



# Projekt Campaign Management Form :rocket:

Projekt został stworzony w ramach zadania rekrutacyjnego. Jego głównym celem jest umożliwienie tworzenia oraz edycji kampanii reklamowych. Formularz (`CampaignFormComponent`) został wykonany jako komponent Angular (standalone) wykorzystujący **Reactive Forms** oraz mechanizmy **RxJS**. Dzięki zastosowaniu zaawansowanych walidacji oraz funkcji autozapisu, aplikacja zwiększa wygodę użytkowania i poprawia jakość wprowadzanych danych.

---

## :gear: Technologie

- **Angular** (wykorzystująca standalone components)
- **TypeScript**
- **RxJS** – obsługa asynchronicznych zdarzeń i strumieni danych
- **Tailwind CSS** – stylizacja komponentu przy użyciu klas narzędziowych

---

## :clipboard: Komponent `CampaignFormComponent`

Komponent `CampaignFormComponent` odpowiada za wyświetlanie formularza umożliwiającego:

- :sparkles: **Tworzenie nowej kampanii**
- :pencil2: **Edycję istniejącej kampanii**

Jego główne zadania obejmują:
- Inicjalizację formularza z wykorzystaniem **Reactive Forms**
- Pobieranie danych (w trybie edycji) przy użyciu `CampaignService`
- Dynamiczną aktualizację walidatorów
- Autozapis danych w `localStorage`

---

## :memo: Struktura formularza

Formularz został zdefiniowany przy użyciu `FormBuilder` i zawiera następujące pola:

- **`name`** – nazwa kampanii (*pole wymagane*)
- **`keywords`** – tablica słów kluczowych (*pole wymagane; elementy można dodawać lub usuwać dynamicznie*)
- **`bidAmount`** – stawka kampanii (PLN, *wymagana, minimalna wartość 0.1*)
- **`campaignFund`** – budżet kampanii (PLN, *pole wymagane*)
- **`status`** – status kampanii (np. aktywna/nieaktywna)
- **`town`** – lokalizacja kampanii – dostępne opcje: *New York, Los Angeles, Chicago, Houston, Phoenix*
- **`radius`** – promień działania kampanii (km; *walidacja dynamiczna w zależności od wybranego miasta*)
- **`logo`** – opcjonalne pole do przesłania grafiki/logo kampanii

Dodatkowo, formularz korzysta z niestandardowego walidatora **`fundValidator`**, który kontroluje spójność budżetu kampanii z pozostałymi danymi.

---

## :sparkles: Główne funkcjonalności

### :arrows_clockwise: Tryby pracy – dodawanie i edycja

- **Tryb edycji:**  
  Jeżeli w parametrze routingu (`id`) znajduje się identyfikator kampanii, formularz ładuje dane przy użyciu metody `loadCampaign()` i ustawia tryb edycji (`isEditMode = true`).

- **Tryb dodawania:**  
  W przypadku braku parametru `id` formularz jest inicjalizowany do tworzenia nowej kampanii. Uruchamiane są metody:
  - `addKeyword()` – dodanie pierwszego kontrolera do tablicy słów kluczowych
  - `loadAutoSavedData()` – przywraca dane zapisane w `localStorage`

### :white_check_mark: Walidacja formularza

- **Walidatory pól:**  
  Każde pole posiada przypisane odpowiednie walidatory Angulara, np. `Validators.required`, `Validators.min`, `Validators.max` oraz niestandardowy `fundValidator`.

- **Feedback wizualny:**  
  Formularz dynamicznie wyświetla komunikaty oraz ikony (np. :white_check_mark: lub :x:) w zależności od stanu poprawności wprowadzonych danych.

### :repeat: Dynamiczne aktualizowanie walidatorów (Promień)

- W zależności od wybranej lokalizacji (`town`), pole `radius` otrzymuje różne limity:
  - **Dla New York:** zakres od 1 do 50 km.
  - **Dla pozostałych miast:** zakres od 1 do 100 km.
- Funkcja `updateAvailableRadius(town: string)` aktualizuje walidatory pola `radius` przy każdej zmianie wartości `town`.

### :floppy_disk: Autozapis formularza

- Formularz zapisuje swoje dane do `localStorage` automatycznie, gdy nastąpi zmiana (przy użyciu operatora RxJS `debounceTime(1000)`).
- Po pomyślnym zapisaniu lub aktualizacji kampanii dane autozapisane zostają usunięte z `localStorage`.

### :keyboard: Obsługa słów kluczowych

- Użytkownik może dynamicznie dodawać lub usuwać pola w tablicy `keywords` za pomocą metod:
  - `addKeyword()`
  - `removeKeyword(index: number)`

### :paperclip: Obsługa załączników (logo kampanii)

- Metoda `onFileChange(event: Event)` odpowiada za obsługę przesłanych plików:
  - **Walidacja typu pliku:** akceptowane są tylko obrazy.
  - **Opcjonalna walidacja rozmiaru:** maks. 5 MB.
  - Wczytywanie obrazu przy użyciu `FileReader` i zapis wyniku (Base64) do zmiennej `selectedFile`.
  - Wizualizacja postępu uploadu przez zmianę zmiennej `uploadProgress`.

---

## :file_folder: Struktura projektu

Projekt został podzielony na moduły i foldery tematyczne, co ułatwia utrzymanie i rozwój aplikacji:

- **`components/`** – zawiera komponenty Angulara (m.in. `CampaignFormComponent` wraz z plikami HTML, TailwindCSS oraz testami).
- **`models/`** – definicje interfejsów (np. `Campaign`).
- **`validators/`** – niestandardowe walidatory (np. `fundValidator`).
- **`services/`** – serwisy odpowiedzialne za komunikację z backendem (np. `CampaignService`) oraz wyświetlanie powiadomień (`ToastService`).
- **`pipes/`** – niestandardowe pipe’y (np. `SafeUrlPipe`), wykorzystywane do bezpiecznego wyświetlania treści.
- **`tokens/`** – definicje tokenów zależności (np. `LOCAL_STORAGE`), umożliwiające wstrzykiwanie odpowiednich obiektów.

---

## :trophy: Podsumowanie

Projekt **Campaign Management Form** to kompletny system umożliwiający tworzenie oraz edycję kampanii reklamowych z wykorzystaniem nowoczesnych technologii Angulara. Kluczowe elementy projektu to:

- **Reactive Forms** z rozbudowaną walidacją i dynamiczną aktualizacją pól.
- **Autozapis danych** w `localStorage`, co poprawia doświadczenie użytkownika.
- **Obsługa przesyłania plików** z walidacją typu i rozmiaru.

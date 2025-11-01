#include <iostream>
#include "hash_table.h"
#include "chaining.h"
#include "probing.h"
#include "double_hashing.h"

void displayMenu() {
    std::cout << "\nHash Table Operations:" << std::endl;
    std::cout << "1. Insert a key" << std::endl;
    std::cout << "2. Search for a key" << std::endl;
    std::cout << "3. Display all hash tables" << std::endl;
    std::cout << "4. Exit" << std::endl;
    std::cout << "Enter your choice: ";
}

int main() {
    int tableSize;
    std::cout << "Enter the size of hash tables: ";
    std::cin >> tableSize;

    // Create instances of all hash tables
    SeparateChaining chainTable(tableSize);
    LinearProbing linearTable(tableSize);
    QuadraticProbing quadraticTable(tableSize);
    DoubleHashing doubleTable(tableSize);

    int choice, key;
    do {
        displayMenu();
        std::cin >> choice;

        switch(choice) {
            case 1:
                std::cout << "Enter key to insert: ";
                std::cin >> key;
                std::cout << "\nInserting " << key << " in all tables:" << std::endl;
                chainTable.insert(key);
                linearTable.insert(key);
                quadraticTable.insert(key);
                doubleTable.insert(key);
                break;

            case 2:
                std::cout << "Enter key to search: ";
                std::cin >> key;
                std::cout << "\nSearch results for key " << key << ":" << std::endl;
                std::cout << "Separate Chaining: " << (chainTable.search(key) ? "Found" : "Not Found") << std::endl;
                std::cout << "Linear Probing: " << (linearTable.search(key) ? "Found" : "Not Found") << std::endl;
                std::cout << "Quadratic Probing: " << (quadraticTable.search(key) ? "Found" : "Not Found") << std::endl;
                std::cout << "Double Hashing: " << (doubleTable.search(key) ? "Found" : "Not Found") << std::endl;
                break;

            case 3:
                chainTable.display();
                linearTable.display();
                quadraticTable.display();
                doubleTable.display();
                break;

            case 4:
                std::cout << "Exiting program..." << std::endl;
                break;

            default:
                std::cout << "Invalid choice! Please try again." << std::endl;
        }
    } while (choice != 4);

    return 0;
}
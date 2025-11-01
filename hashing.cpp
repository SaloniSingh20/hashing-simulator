#include <iostream>
#include <vector>
#include <list>
using namespace std;

// Constants
const int TABLE_SIZE = 10;

// Function to print a line of dashes
void printLine() {
    cout << "\n----------------------------------------\n";
}

// 1. Separate Chaining (Open Hashing)
class SeparateChaining {
private:
    vector<list<int>> table;
    
public:
    SeparateChaining() {
        table.resize(TABLE_SIZE);
    }
    
    int hash(int key) {
        return key % TABLE_SIZE;
    }
    
    void insert(int key) {
        int index = hash(key);
        table[index].push_back(key);
    }
    
    bool search(int key) {
        int index = hash(key);
        for(int item : table[index]) {
            if(item == key) return true;
        }
        return false;
    }
    
    void display() {
        printLine();
        cout << "Separate Chaining Hash Table:\n";
        for(int i = 0; i < TABLE_SIZE; i++) {
            cout << i << " --> ";
            if(table[i].empty()) {
                cout << "NULL";
            } else {
                for(int item : table[i]) {
                    cout << item << " -> ";
                }
                cout << "NULL";
            }
            cout << endl;
        }
    }
};

// 2. Linear Probing
class LinearProbing {
private:
    vector<pair<int, bool>> table; // {key, isOccupied}
    
public:
    LinearProbing() {
        table.resize(TABLE_SIZE, {0, false});
    }
    
    int hash(int key) {
        return key % TABLE_SIZE;
    }
    
    void insert(int key) {
        int index = hash(key);
        int i = 0;
        
        while(i < TABLE_SIZE) {
            int newIndex = (index + i) % TABLE_SIZE;
            if(!table[newIndex].second) {
                table[newIndex] = {key, true};
                return;
            }
            i++;
        }
        cout << "Table is full!" << endl;
    }
    
    bool search(int key) {
        int index = hash(key);
        int i = 0;
        
        while(i < TABLE_SIZE) {
            int newIndex = (index + i) % TABLE_SIZE;
            if(!table[newIndex].second) return false;
            if(table[newIndex].first == key) return true;
            i++;
        }
        return false;
    }
    
    void display() {
        printLine();
        cout << "Linear Probing Hash Table:\n";
        for(int i = 0; i < TABLE_SIZE; i++) {
            cout << i << " --> ";
            if(table[i].second) {
                cout << table[i].first;
            } else {
                cout << "NULL";
            }
            cout << endl;
        }
    }
};

// 3. Quadratic Probing
class QuadraticProbing {
private:
    vector<pair<int, bool>> table;
    
public:
    QuadraticProbing() {
        table.resize(TABLE_SIZE, {0, false});
    }
    
    int hash(int key) {
        return key % TABLE_SIZE;
    }
    
    void insert(int key) {
        int index = hash(key);
        int i = 0;
        
        while(i < TABLE_SIZE) {
            int newIndex = (index + i*i) % TABLE_SIZE;
            if(!table[newIndex].second) {
                table[newIndex] = {key, true};
                return;
            }
            i++;
        }
        cout << "Could not insert key " << key << endl;
    }
    
    bool search(int key) {
        int index = hash(key);
        int i = 0;
        
        while(i < TABLE_SIZE) {
            int newIndex = (index + i*i) % TABLE_SIZE;
            if(!table[newIndex].second) return false;
            if(table[newIndex].first == key) return true;
            i++;
        }
        return false;
    }
    
    void display() {
        printLine();
        cout << "Quadratic Probing Hash Table:\n";
        for(int i = 0; i < TABLE_SIZE; i++) {
            cout << i << " --> ";
            if(table[i].second) {
                cout << table[i].first;
            } else {
                cout << "NULL";
            }
            cout << endl;
        }
    }
};

// 4. Double Hashing
class DoubleHashing {
private:
    vector<pair<int, bool>> table;
    
public:
    DoubleHashing() {
        table.resize(TABLE_SIZE, {0, false});
    }
    
    int hash1(int key) {
        return key % TABLE_SIZE;
    }
    
    int hash2(int key) {
        return 7 - (key % 7); // 7 is chosen as it's a prime number less than table size
    }
    
    void insert(int key) {
        int index = hash1(key);
        int step = hash2(key);
        int i = 0;
        
        while(i < TABLE_SIZE) {
            int newIndex = (index + i * step) % TABLE_SIZE;
            if(!table[newIndex].second) {
                table[newIndex] = {key, true};
                return;
            }
            i++;
        }
        cout << "Could not insert key " << key << endl;
    }
    
    bool search(int key) {
        int index = hash1(key);
        int step = hash2(key);
        int i = 0;
        
        while(i < TABLE_SIZE) {
            int newIndex = (index + i * step) % TABLE_SIZE;
            if(!table[newIndex].second) return false;
            if(table[newIndex].first == key) return true;
            i++;
        }
        return false;
    }
    
    void display() {
        printLine();
        cout << "Double Hashing Table:\n";
        for(int i = 0; i < TABLE_SIZE; i++) {
            cout << i << " --> ";
            if(table[i].second) {
                cout << table[i].first;
            } else {
                cout << "NULL";
            }
            cout << endl;
        }
    }
};

int main() {
    SeparateChaining chain;
    LinearProbing linear;
    QuadraticProbing quadratic;
    DoubleHashing doubleHash;
    
    int choice, key;
    
    do {
        printLine();
        cout << "\nHash Table Operations:\n";
        cout << "1. Insert a key\n";
        cout << "2. Search for a key\n";
        cout << "3. Display all hash tables\n";
        cout << "4. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;
        
        switch(choice) {
            case 1:
                cout << "Enter key to insert: ";
                cin >> key;
                cout << "\nInserting " << key << " in all tables:";
                chain.insert(key);
                linear.insert(key);
                quadratic.insert(key);
                doubleHash.insert(key);
                break;
                
            case 2:
                cout << "Enter key to search: ";
                cin >> key;
                cout << "\nSearch results for key " << key << ":";
                printLine();
                cout << "Separate Chaining: " << (chain.search(key) ? "Found" : "Not Found") << endl;
                cout << "Linear Probing: " << (linear.search(key) ? "Found" : "Not Found") << endl;
                cout << "Quadratic Probing: " << (quadratic.search(key) ? "Found" : "Not Found") << endl;
                cout << "Double Hashing: " << (doubleHash.search(key) ? "Found" : "Not Found") << endl;
                break;
                
            case 3:
                chain.display();
                linear.display();
                quadratic.display();
                doubleHash.display();
                break;
                
            case 4:
                cout << "Exiting program...\n";
                break;
                
            default:
                cout << "Invalid choice! Please try again.\n";
        }
    } while(choice != 4);
    
    return 0;
}
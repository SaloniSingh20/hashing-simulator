#ifndef PROBING_H
#define PROBING_H

#include "hash_table.h"

// Linear Probing implementation
class LinearProbing : public HashTableBase {
private:
    std::vector<std::pair<int, bool>> table;  // pair of <key, isOccupied>

public:
    LinearProbing(int size) : HashTableBase(size) {
        table.resize(size, {0, false});
    }

    void insert(int key) override {
        if (numElements >= tableSize) {
            std::cout << "Hash table is full!" << std::endl;
            return;
        }

        int index = hashFunction(key);
        int i = 0;
        
        while (table[index].second) {
            index = (hashFunction(key) + i) % tableSize;
            i++;
        }
        
        table[index] = {key, true};
        numElements++;
    }

    bool search(int key) override {
        int index = hashFunction(key);
        int i = 0;
        
        while (table[index].second) {
            if (table[index].first == key)
                return true;
            index = (hashFunction(key) + i) % tableSize;
            i++;
            if (i >= tableSize) break;
        }
        return false;
    }

    void display() override {
        std::cout << "\nLinear Probing Hash Table:" << std::endl;
        for (int i = 0; i < tableSize; i++) {
            std::cout << i << " --> ";
            if (table[i].second) {
                std::cout << table[i].first;
            } else {
                std::cout << "NULL";
            }
            std::cout << std::endl;
        }
    }
};

// Quadratic Probing implementation
class QuadraticProbing : public HashTableBase {
private:
    std::vector<std::pair<int, bool>> table;

public:
    QuadraticProbing(int size) : HashTableBase(size) {
        table.resize(size, {0, false});
    }

    void insert(int key) override {
        if (numElements >= tableSize) {
            std::cout << "Hash table is full!" << std::endl;
            return;
        }

        int index = hashFunction(key);
        int i = 0;
        
        while (table[index].second) {
            index = (hashFunction(key) + i*i) % tableSize;
            i++;
            if (i >= tableSize) {
                std::cout << "Cannot insert key " << key << ": No available slot found" << std::endl;
                return;
            }
        }
        
        table[index] = {key, true};
        numElements++;
    }

    bool search(int key) override {
        int index = hashFunction(key);
        int i = 0;
        
        while (table[index].second) {
            if (table[index].first == key)
                return true;
            index = (hashFunction(key) + i*i) % tableSize;
            i++;
            if (i >= tableSize) break;
        }
        return false;
    }

    void display() override {
        std::cout << "\nQuadratic Probing Hash Table:" << std::endl;
        for (int i = 0; i < tableSize; i++) {
            std::cout << i << " --> ";
            if (table[i].second) {
                std::cout << table[i].first;
            } else {
                std::cout << "NULL";
            }
            std::cout << std::endl;
        }
    }
};

#endif
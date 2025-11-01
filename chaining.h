#ifndef CHAINING_H
#define CHAINING_H

#include "hash_table.h"

// Separate Chaining (Open Hashing) implementation
class SeparateChaining : public HashTableBase {
private:
    std::vector<std::list<int>> table;

public:
    SeparateChaining(int size) : HashTableBase(size) {
        table.resize(size);
    }

    void insert(int key) override {
        int index = hashFunction(key);
        table[index].push_back(key);
        numElements++;
    }

    bool search(int key) override {
        int index = hashFunction(key);
        for (int item : table[index]) {
            if (item == key) return true;
        }
        return false;
    }

    void display() override {
        std::cout << "\nSeparate Chaining Hash Table:" << std::endl;
        for (int i = 0; i < tableSize; i++) {
            std::cout << i << " --> ";
            if (table[i].empty()) {
                std::cout << "NULL";
            } else {
                for (int item : table[i]) {
                    std::cout << item << " -> ";
                }
                std::cout << "NULL";
            }
            std::cout << std::endl;
        }
    }
};

#endif
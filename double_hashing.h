#ifndef DOUBLE_HASHING_H
#define DOUBLE_HASHING_H

#include "hash_table.h"

class DoubleHashing : public HashTableBase {
private:
    std::vector<std::pair<int, bool>> table;

public:
    DoubleHashing(int size) : HashTableBase(size) {
        table.resize(size, {0, false});
    }

    void insert(int key) override {
        if (numElements >= tableSize) {
            std::cout << "Hash table is full!" << std::endl;
            return;
        }

        int index = hashFunction(key);
        int step = hash2(key);
        int i = 0;
        
        while (table[index].second) {
            index = (hashFunction(key) + i * step) % tableSize;
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
        int step = hash2(key);
        int i = 0;
        
        while (table[index].second) {
            if (table[index].first == key)
                return true;
            index = (hashFunction(key) + i * step) % tableSize;
            i++;
            if (i >= tableSize) break;
        }
        return false;
    }

    void display() override {
        std::cout << "\nDouble Hashing Table:" << std::endl;
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
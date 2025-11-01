#ifndef HASH_TABLE_H
#define HASH_TABLE_H

#include <iostream>
#include <vector>
#include <list>
#include <string>
#include <iomanip>

// Base class for hash tables
class HashTableBase {
protected:
    int tableSize;
    int numElements;

public:
    HashTableBase(int size) : tableSize(size), numElements(0) {}
    virtual ~HashTableBase() = default;

    virtual void insert(int key) = 0;
    virtual bool search(int key) = 0;
    virtual void display() = 0;
    
protected:
    // Primary hash function
    int hashFunction(int key) {
        return key % tableSize;
    }

    // Secondary hash function for double hashing
    int hash2(int key) {
        return 7 - (key % 7);  // Common second hash function
    }
};

#endif
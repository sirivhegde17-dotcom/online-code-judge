import React from 'react';

export const STARTER_CODE_TEMPLATES = {
  PYTHON: `# Solution in Python 3
import sys

def solve():
    # Write your solution logic here
    lines = sys.stdin.read().split()
    if not lines:
        return
    # Example: print sum of two integers
    # a, b = map(int, lines[:2])
    # print(a + b)

if __name__ == '__main__':
    solve()
`,
  CPP: `// Solution in C++17
#include <iostream>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Write your solution logic here
    
    return 0;
}
`,
  JAVA: `// Solution in Java 17
import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Write your solution logic here
        
        scanner.close();
    }
}
`,
};

const LanguageSelector = ({ selectedLanguage, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-xs font-semibold text-slate-400">Language:</label>
      <select
        value={selectedLanguage}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-100 font-semibold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors"
      >
        <option value="PYTHON">Python 3</option>
        <option value="CPP">C++17 (GCC)</option>
        <option value="JAVA">Java 17 (OpenJDK)</option>
      </select>
    </div>
  );
};

export default LanguageSelector;

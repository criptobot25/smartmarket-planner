#!/usr/bin/env python3
"""
Script to replace category string literals with CATEGORIES constants
"""
import os
import re
from pathlib import Path

# Define the replacements
CATEGORY_REPLACEMENTS = {
    r'=== "protein"': '=== CATEGORIES.protein',
    r'=== "carbs"': '=== CATEGORIES.carbs',
    r'=== "vegetables"': '=== CATEGORIES.vegetables',
    r'=== "fruits"': '=== CATEGORIES.fruits',
    r'=== "dairy"': '=== CATEGORIES.dairy',
    r'=== "fats"': '=== CATEGORIES.fats',
    r'=== "grains"': '=== CATEGORIES.grains',
    r'=== "legumes"': '=== CATEGORIES.legumes',
    r'=== "snacks"': '=== CATEGORIES.snacks',
    r'=== "supplements"': '=== CATEGORIES.supplements',
    r'=== "others"': '=== CATEGORIES.others',
    
    r'!== "protein"': '!== CATEGORIES.protein',
    r'!== "carbs"': '!== CATEGORIES.carbs',
    r'!== "vegetables"': '!== CATEGORIES.vegetables',
    r'!== "fruits"': '!== CATEGORIES.fruits',
    r'!== "dairy"': '!== CATEGORIES.dairy',
    r'!== "fats"': '!== CATEGORIES.fats',
    r'!== "grains"': '!== CATEGORIES.grains',
    r'!== "legumes"': '!== CATEGORIES.legumes',
    r'!== "snacks"': '!== CATEGORIES.snacks',
    r'!== "supplements"': '!== CATEGORIES.supplements',
    r'!== "others"': '!== CATEGORIES.others',
    
    r'\["protein", "carbs", "vegetables", "fruits", "dairy", "fats", "grains", "legumes", "snacks", "supplements", "others"\]': '[CATEGORIES.protein, CATEGORIES.carbs, CATEGORIES.vegetables, CATEGORIES.fruits, CATEGORIES.dairy, CATEGORIES.fats, CATEGORIES.grains, CATEGORIES.legumes, CATEGORIES.snacks, CATEGORIES.supplements, CATEGORIES.others]',
    
    r'\("protein"\)': '(CATEGORIES.protein)',
    r'\("carbs"\)': '(CATEGORIES.carbs)',
    r'\("vegetables"\)': '(CATEGORIES.vegetables)',
    r'\("fruits"\)': '(CATEGORIES.fruits)',
    r'\("dairy"\)': '(CATEGORIES.dairy)',
    r'\("fats"\)': '(CATEGORIES.fats)',
    r'\("grains"\)': '(CATEGORIES.grains)',
    r'\("legumes"\)': '(CATEGORIES.legumes)',
    r'\("snacks"\)': '(CATEGORIES.snacks)',
    r'\("supplements"\)': '(CATEGORIES.supplements)',
    r'\("others"\)': '(CATEGORIES.others)',
}

# Import statement to add
IMPORT_STATEMENT = 'import { CATEGORIES } from "../core/constants/categories";\n'
IMPORT_STATEMENT_NESTED = 'import { CATEGORIES } from "../../core/constants/categories";\n'
IMPORT_STATEMENT_DEEP = 'import { CATEGORIES } from "../../../core/constants/categories";\n'

def should_skip_file(filepath):
    """Check if file should be skipped"""
    skip_patterns = ['node_modules', '.git', 'dist', 'build', 'categories.ts']
    return any(pattern in str(filepath) for pattern in skip_patterns)

def get_import_statement(filepath):
    """Determine correct import path based on file location"""
    parts = Path(filepath).parts
    if 'tests' in parts:
        return IMPORT_STATEMENT_NESTED
    elif 'logic' in parts or 'utils' in parts or 'export' in parts or 'premium' in parts or 'storage' in parts:
        return IMPORT_STATEMENT_NESTED
    elif 'components' in parts or 'pages' in parts:
        return IMPORT_STATEMENT_DEEP
    else:
        return IMPORT_STATEMENT

def add_import_if_needed(content, filepath):
    """Add CATEGORIES import if needed and not already present"""
    if 'CATEGORIES' in content and 'import { CATEGORIES }' not in content:
        import_stmt = get_import_statement(filepath)
        # Find the first import statement and add after it
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('import '):
                lines.insert(i + 1, import_stmt.rstrip())
                return '\n'.join(lines)
        # If no import found, add at the beginning
        return import_stmt + content
    return content

def update_file(filepath):
    """Update a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Apply replacements
        for pattern, replacement in CATEGORY_REPLACEMENTS.items():
            content = re.sub(pattern, replacement, content)
        
        # Add import if needed
        if content != original:
            content = add_import_if_needed(content, filepath)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    return False

def main():
    root = Path(r"c:\Users\Ana Victoria\Desktop\SmartMarket Planner\src")
    updated = 0
    
    for filepath in root.rglob('*.ts'):
        if should_skip_file(filepath):
            continue
        
        if update_file(filepath):
            print(f"Updated: {filepath}")
            updated += 1
    
    for filepath in root.rglob('*.tsx'):
        if should_skip_file(filepath):
            continue
        
        if update_file(filepath):
            print(f"Updated: {filepath}")
            updated += 1
    
    print(f"\n✅ Updated {updated} files")

if __name__ == "__main__":
    main()

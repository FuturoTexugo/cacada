import os
from datetime import datetime

def print_tree(start_path='.', prefix='', level=0, max_level=5, is_last=False):
    """Gera árvore de pastas de forma limpa e organizada"""
    if level > max_level:
        return

    try:
        entries = sorted(os.listdir(start_path))
    except (PermissionError, FileNotFoundError):
        return

    # Ignorar pastas irrelevantes
    ignore = {
        '.obsidian', '.git', '__pycache__', 'venv', '.venv', 
        '.idea', 'env', 'node_modules', '.DS_Store'
    }
    
    entries = [e for e in entries if e not in ignore]

    for i, entry in enumerate(entries):
        path = os.path.join(start_path, entry)
        is_last_entry = i == len(entries) - 1
        
        # Conector visual
        connector = '└── ' if is_last_entry else '├── '
        
        # Cor para pastas
        if os.path.isdir(path):
            print(prefix + connector + f"\033[94m{entry}\033[0m")
            new_prefix = prefix + ('    ' if is_last_entry else '│   ')
            print_tree(path, new_prefix, level + 1, max_level, is_last_entry)
        else:
            print(prefix + connector + entry)


if __name__ == "__main__":
    root_name = "A Caçada"  # Nome da pasta raiz
    
    print(f"📅 Árvore gerada em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
    print(f"{root_name}/")
    
    print_tree(".", prefix="    ", max_level=6)
    
    print("\n✅ Árvore gerada com sucesso!")
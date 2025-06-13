Import('env')

# Adiciona includes globais
env.Append(CPPPATH=[
    env.get('PROJECT_DIR') + '/include',
    env.get('PROJECT_DIR') + '/lib/AC/include',
    env.get('PROJECT_DIR') + '/lib/IR/include',
    env.get('PROJECT_DIR') + '/lib/Network/include',
    env.get('PROJECT_DIR') + '/src'
])

# Configurações de compilação
env.Append(CXXFLAGS=[
    '-std=gnu++17',
    '-Wno-deprecated-declarations',
    '-fno-exceptions',
    '-fno-rtti'
])

# Arduino core paths
ARDUINO_CORE = env.get('PLATFORM_DIR') + '/framework-arduinoespressif32'
env.Append(CPPPATH=[
    ARDUINO_CORE + '/cores/esp32',
    ARDUINO_CORE + '/tools/sdk/esp32/include',
    ARDUINO_CORE + '/variants/esp32'
])

# Bibliotecas
env.Append(LIBS=[
    'm',  # Math library
    'stdc++',  # C++ standard library
])

# Debug flags
if env.get('PIOENV') == 'debug':
    env.Append(CXXFLAGS=[
        '-O0',
        '-ggdb3',
        '-DDEBUG'
    ])
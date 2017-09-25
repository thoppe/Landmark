from fabric.api import local

def dev():
    # Creates a dev network with a known seed
    local("testrpc --seed 2048")

def serve():
    local("cp -rf build docs/")
    local("npm run dev")

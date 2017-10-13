from fabric.api import local

def dev():
    # Creates a dev network with a known seed
    local("testrpc --seed 2048")

def deploy():
    local("truffle deploy")
    local("cp -rf build docs/")

def serve():
    local("npm run dev")

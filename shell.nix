{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  name = "astro-portfolio-dev";

  buildInputs = with pkgs; [
    bun
    nodejs_22
  ];

  shellHook = ''
    # Set up Bun cache directory
    export BUN_INSTALL="$PWD/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
  '';

  env = {
    NODE_ENV = "development";
    # Bun-specific optimizations
    BUN_RUNTIME_TRANSPILER_CACHE_PATH = ".bun-cache";
  };
}

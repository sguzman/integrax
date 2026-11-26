{
  description = "Integrax research shell";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
  outputs = { self, nixpkgs }: {
    devShells = nixpkgs.lib.genAttrs [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ] (system:
      let pkgs = import nixpkgs { inherit system; }; in {
        default = pkgs.mkShell { packages = with pkgs; [ cargo rustc rustfmt clippy git gmp gzip xz zstd fish wrkflw gh jq openssl coreutils gnused gnugrep nodejs curl unzip bash time ]; };
      });
  };
}

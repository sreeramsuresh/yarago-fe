const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-2xl font-bold">
        <span className="text-primary">yara</span>
        <span className="text-accent">go</span>
      </span>
    </div>
  );
};

export default Logo;

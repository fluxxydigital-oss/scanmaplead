import React from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreGauge({ score, size = 120, strokeWidth = 8 }: ScoreGaugeProps) {
  // O componente renderiza um semi-círculo (180 graus).
  // A altura do container é o raio + a espessura da linha.
  const radius = (size - strokeWidth) / 2;
  const height = radius + strokeWidth;
  const cx = size / 2;
  const cy = height - strokeWidth / 2; // Centraliza verticalmente o fim do arco
  
  // Perímetro do semi-círculo = pi * r
  const dashArray = Math.PI * radius;
  // Offset define o preenchimento (quanto menor, mais cheio)
  const dashOffset = dashArray - (dashArray * Math.min(Math.max(score, 0), 100)) / 100;

  // Cor adaptável
  let color = "#20D66B"; // Verde (Hot)
  if (score < 40) color = "#FF7A93"; // Vermelho (Cold)
  else if (score < 70) color = "#F2C14E"; // Amarelo (Medium)

  return (
    <div 
      className="relative flex flex-col items-center mx-auto" 
      style={{ width: size, height: height + 8 }} // +8 para acomodar os números
    >
      <svg
        width={size}
        height={height}
        viewBox={`0 0 ${size} ${height}`}
        className="overflow-visible"
      >
        {/* Track de Fundo */}
        <path
          d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
          fill="none"
          stroke="#2A2E35"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progresso */}
        <path
          d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Texto de Score absoluto ao centro da base */}
      <div className="absolute bottom-0 flex items-baseline">
        <span className="text-[28px] font-bold text-[#F4F4F5] leading-none tracking-tight">{score}</span>
        <span className="text-[15px] font-medium text-[#8F939B] leading-none">/100</span>
      </div>
    </div>
  );
}

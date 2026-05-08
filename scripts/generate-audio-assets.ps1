$ErrorActionPreference = 'Stop'

$sampleRate = 44100
$outputDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\sounds'
New-Item -ItemType Directory -Force $outputDir | Out-Null

function Write-WavFile {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][double[]]$Samples
  )

  $dataSize = $Samples.Length * 2
  $buffer = New-Object byte[] (44 + $dataSize)

  [Text.Encoding]::ASCII.GetBytes('RIFF').CopyTo($buffer, 0)
  [BitConverter]::GetBytes([UInt32](36 + $dataSize)).CopyTo($buffer, 4)
  [Text.Encoding]::ASCII.GetBytes('WAVE').CopyTo($buffer, 8)
  [Text.Encoding]::ASCII.GetBytes('fmt ').CopyTo($buffer, 12)
  [BitConverter]::GetBytes([UInt32]16).CopyTo($buffer, 16)
  [BitConverter]::GetBytes([UInt16]1).CopyTo($buffer, 20)
  [BitConverter]::GetBytes([UInt16]1).CopyTo($buffer, 22)
  [BitConverter]::GetBytes([UInt32]$sampleRate).CopyTo($buffer, 24)
  [BitConverter]::GetBytes([UInt32]($sampleRate * 2)).CopyTo($buffer, 28)
  [BitConverter]::GetBytes([UInt16]2).CopyTo($buffer, 32)
  [BitConverter]::GetBytes([UInt16]16).CopyTo($buffer, 34)
  [Text.Encoding]::ASCII.GetBytes('data').CopyTo($buffer, 36)
  [BitConverter]::GetBytes([UInt32]$dataSize).CopyTo($buffer, 40)

  for ($i = 0; $i -lt $Samples.Length; $i++) {
    $sample = [Math]::Max(-0.98, [Math]::Min(0.98, $Samples[$i]))
    [BitConverter]::GetBytes([Int16]([Math]::Round($sample * 32767))).CopyTo($buffer, 44 + ($i * 2))
  }

  [IO.File]::WriteAllBytes((Join-Path $outputDir $Name), $buffer)
}

function Get-Envelope {
  param(
    [double]$Time,
    [double]$Duration,
    [double]$Attack = 0.015,
    [double]$Release = 0.12
  )

  $attackGain = if ($Attack -le 0) { 1 } else { [Math]::Min(1, $Time / $Attack) }
  $releaseGain = if ($Release -le 0) { 1 } else { [Math]::Min(1, ($Duration - $Time) / $Release) }
  return [Math]::Max(0, [Math]::Min($attackGain, $releaseGain))
}

function New-Tone {
  param(
    [double]$Duration,
    [object[]]$Notes,
    [double]$Gain = 0.55
  )

  $length = [int]($Duration * $sampleRate)
  $samples = New-Object double[] $length

  for ($i = 0; $i -lt $length; $i++) {
    $time = $i / $sampleRate
    $value = 0.0

    foreach ($note in $Notes) {
      $start = [double]$note.Start
      $noteDuration = [double]$note.Duration
      $end = $start + $noteDuration

      if ($time -ge $start -and $time -le $end) {
        $localTime = $time - $start
        $frequency = [double]$note.Frequency
        $wave = [Math]::Sin(2 * [Math]::PI * $frequency * $localTime)
        $harmonic = 0.35 * [Math]::Sin(2 * [Math]::PI * ($frequency * 2) * $localTime)
        $value += ($wave + $harmonic) * (Get-Envelope $localTime $noteDuration)
      }
    }

    $samples[$i] = ($value / [Math]::Max(1, $Notes.Count)) * $Gain
  }

  return $samples
}

function New-NoiseLoop {
  param(
    [double]$Duration,
    [double]$Gain,
    [uint32]$Seed,
    [double]$LowPass = 0.80,
    [double]$ToneFrequency = 0
  )

  $length = [int]($Duration * $sampleRate)
  $samples = New-Object double[] $length
  $filtered = 0.0

  for ($i = 0; $i -lt $length; $i++) {
    $time = $i / $sampleRate
    $raw = [Math]::Sin((($i + 1) * 12.9898) + ($Seed * 78.233)) * 43758.5453
    $white = (($raw - [Math]::Floor($raw)) * 2) - 1
    $filtered = ($LowPass * $filtered) + ((1 - $LowPass) * $white)
    $tone = if ($ToneFrequency -gt 0) { [Math]::Sin(2 * [Math]::PI * $ToneFrequency * $time) * 0.18 } else { 0 }
    $loopFade = [Math]::Sin([Math]::PI * $i / [Math]::Max(1, $length - 1))
    $samples[$i] = ($filtered + $tone + ($white * 0.18)) * $Gain * (0.55 + 0.45 * $loopFade)
  }

  return $samples
}

function New-DeepFocusLoop {
  param([double]$Duration)

  $length = [int]($Duration * $sampleRate)
  $samples = New-Object double[] $length
  $filtered = 0.0

  for ($i = 0; $i -lt $length; $i++) {
    $time = $i / $sampleRate
    $raw = [Math]::Sin((($i + 1) * 12.9898) + (904 * 78.233)) * 43758.5453
    $noise = (($raw - [Math]::Floor($raw)) * 2) - 1
    $filtered = (0.997 * $filtered) + (0.003 * $noise)
    $pad =
      0.34 * [Math]::Sin(2 * [Math]::PI * 110.00 * $time) +
      0.24 * [Math]::Sin(2 * [Math]::PI * 146.83 * $time) +
      0.20 * [Math]::Sin(2 * [Math]::PI * 220.00 * $time) +
      0.12 * [Math]::Sin(2 * [Math]::PI * 293.66 * $time)
    $movement = 0.75 + (0.25 * [Math]::Sin(2 * [Math]::PI * 0.16 * $time))
    $edge = [Math]::Sin([Math]::PI * $i / [Math]::Max(1, $length - 1))
    $samples[$i] = (($pad * $movement) + ($filtered * 0.25)) * 0.32 * (0.65 + 0.35 * $edge)
  }

  return $samples
}

function New-NatureLoop {
  param([double]$Duration)

  $length = [int]($Duration * $sampleRate)
  $samples = New-Object double[] $length
  $base = New-NoiseLoop $Duration 0.24 721 0.94 176

  for ($i = 0; $i -lt $length; $i++) {
    $time = $i / $sampleRate
    $chirp = 0.0
    foreach ($start in @(0.7, 2.1, 3.9, 5.3)) {
      $local = $time - $start
      if ($local -ge 0 -and $local -lt 0.22) {
        $freq = 780 + (420 * $local)
        $chirp += [Math]::Sin(2 * [Math]::PI * $freq * $local) * (Get-Envelope $local 0.22 0.02 0.08) * 0.20
      }
    }
    $samples[$i] = $base[$i] + $chirp
  }

  return $samples
}

function New-Click {
  param([double]$Duration)

  $length = [int]($Duration * $sampleRate)
  $samples = New-Object double[] $length

  for ($i = 0; $i -lt $length; $i++) {
    $time = $i / $sampleRate
    $decay = [Math]::Exp(-72 * $time)
    $tone = [Math]::Sin(2 * [Math]::PI * 1400 * $time)
    $raw = [Math]::Sin((($i + 1) * 12.9898) + (57 * 78.233)) * 43758.5453
    $noise = (($raw - [Math]::Floor($raw)) * 2) - 1
    $samples[$i] = (($tone * 0.75) + ($noise * 0.25)) * $decay * 0.58
  }

  return $samples
}

Write-WavFile 'start.wav' (New-Tone 0.55 @(
  @{ Frequency = 523.25; Start = 0.00; Duration = 0.22 },
  @{ Frequency = 659.25; Start = 0.18; Duration = 0.24 }
) 0.72)

Write-WavFile 'break.wav' (New-Tone 0.62 @(
  @{ Frequency = 392.00; Start = 0.00; Duration = 0.26 },
  @{ Frequency = 493.88; Start = 0.20; Duration = 0.27 }
) 0.68)

Write-WavFile 'complete.wav' (New-Tone 1.05 @(
  @{ Frequency = 523.25; Start = 0.00; Duration = 0.24 },
  @{ Frequency = 659.25; Start = 0.22; Duration = 0.25 },
  @{ Frequency = 783.99; Start = 0.46; Duration = 0.32 }
) 0.72)

Write-WavFile 'pause.wav' (New-Tone 0.42 @(
  @{ Frequency = 440.00; Start = 0.00; Duration = 0.17 },
  @{ Frequency = 349.23; Start = 0.15; Duration = 0.18 }
) 0.58)

Write-WavFile 'tick.wav' (New-Click 0.09)

Write-WavFile 'rain.wav' (New-NoiseLoop 7.0 0.42 113 0.62)
Write-WavFile 'deep-focus.wav' (New-DeepFocusLoop 8.0)
Write-WavFile 'white-noise.wav' (New-NoiseLoop 6.0 0.34 411 0.18)
Write-WavFile 'nature.wav' (New-NatureLoop 7.0)

Get-ChildItem $outputDir -Filter '*.wav' | Sort-Object Name | ForEach-Object {
  $bytes = [IO.File]::ReadAllBytes($_.FullName)
  $peak = 0
  $sumSquares = 0.0
  $count = 0
  for ($i = 44; $i -lt $bytes.Length - 1; $i += 2) {
    $sample = [Math]::Abs([BitConverter]::ToInt16($bytes, $i))
    if ($sample -gt $peak) {
      $peak = $sample
    }
    $normalized = $sample / 32768
    $sumSquares += $normalized * $normalized
    $count++
  }
  $rms = [Math]::Sqrt($sumSquares / [Math]::Max(1, $count))
  [PSCustomObject]@{
    File = $_.Name
    Bytes = $_.Length
    Peak = $peak
    RMS = [Math]::Round($rms, 4)
  }
}
